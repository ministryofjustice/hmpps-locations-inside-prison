import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'
import { Location } from '../../data/types/locationsApi'
import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'
import { NotificationType, notificationGroups } from '../../services/notificationService'
import config from '../../config'
import { getUserEmails, sendNotification } from '../../utils/notificationHelpers'

async function locationToCertificationLocation(
  req: FormWizard.Request,
  location: Location,
): Promise<CertificateLocation> {
  let { workingCapacity, maxCapacity } = location.capacity
  let { certifiedNormalAccommodation: cna } = location.certification

  const { pendingChanges } = location

  if (pendingChanges?.certifiedNormalAccommodation !== undefined) {
    cna = pendingChanges.certifiedNormalAccommodation
  }

  if (pendingChanges?.maxCapacity !== undefined) {
    maxCapacity = pendingChanges.maxCapacity
  }

  if (pendingChanges?.workingCapacity !== undefined) {
    workingCapacity = pendingChanges.workingCapacity
  }

  const certificationLocation: CertificateLocation = {
    id: location.id,
    locationCode: location.code,
    pathHierarchy: location.pathHierarchy,
    level: location.level,
    certifiedNormalAccommodation: cna,
    workingCapacity,
    maxCapacity,
    locationType: location.locationType,
    subLocations: [],
    inCellSanitation: location.inCellSanitation,
    cellMark: location.cellMark,
    specialistCellTypes: location.specialistCellTypes,
    accommodationTypes: location.accommodationTypes,
    usedFor: location.usedFor,
  }

  if (!location.leafLevel) {
    const locationSummary = await req.services.locationsService.getResidentialSummary(
      req.session.systemToken,
      location.prisonId,
      location.id,
    )

    certificationLocation.subLocations = await Promise.all(
      locationSummary.subLocations.map((subLocation: Location) => locationToCertificationLocation(req, subLocation)),
    )
  }

  return certificationLocation
}

export default class Confirm extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(populateLocation())
    this.use(this.generateRequests)
  }

  override async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locals } = res

    locals.accommodationTypeConstants = await req.services.locationsService.getAccommodationTypes(
      req.session.systemToken,
    )
    locals.specialistCellTypesObject = await req.services.locationsService.getSpecialistCellTypes(
      req.session.systemToken,
    )
    locals.usedForConstants = await req.services.locationsService.getUsedForTypes(req.session.systemToken)

    next()
  }

  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(_req, res)

    locals.buttonText = 'Submit for approval'
    return {
      ...locals,
      cancelText: 'Cancel',
    }
  }

  async generateRequests(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locals } = res
    const { sessionModel } = req

    const proposedSignedOpCapChange = sessionModel.get<{
      prisonId: string
      signedOperationalCapacity: number
      reasonForChange: string
    }>('proposedSignedOpCapChange')
    const proposedCertificationApprovalRequests: TypedLocals['proposedCertificationApprovalRequests'] = []

    if (locals.location.status === 'DRAFT') {
      proposedCertificationApprovalRequests.push({
        approvalType: 'DRAFT',
        locations: [await locationToCertificationLocation(req, locals.location)],
      })
    }

    if (req.form.options.name === 'change-door-number') {
      const doorNumber = sessionModel.get<string>('doorNumber')
      const explanation = sessionModel.get<string>('explanation')
      proposedCertificationApprovalRequests.push({
        approvalType: 'CELL_MARK',
        locations: [await locationToCertificationLocation(req, locals.location)],
        reasonForCellMarkChange: explanation,
        cellMarkChange: doorNumber,
      })
    }

    if (proposedSignedOpCapChange) {
      proposedCertificationApprovalRequests.push({
        approvalType: 'SIGNED_OP_CAP',
        prisonId: proposedSignedOpCapChange.prisonId,
        currentSignedOperationCapacity: locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
        signedOperationCapacityChange:
          proposedSignedOpCapChange.signedOperationalCapacity -
          locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
        reasonForSignedOpChange: proposedSignedOpCapChange.reasonForChange,
      })
    }

    locals.proposedCertificationApprovalRequests = proposedCertificationApprovalRequests
    locals.title = `You are requesting ${proposedCertificationApprovalRequests.length > 1 ? `${proposedCertificationApprovalRequests.length} changes` : 'a change'} to the cell certificate`

    next()
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { ingressUrl } = config
    const { systemToken } = req.session
    const { locationsService, manageUsersService, notifyService } = req.services
    const { prisonName } = res.locals.prisonResidentialSummary.prisonSummary
    const { prisonId } = res.locals.location
    const submittedBy = res.locals.user.name

    let id = ''

    const changeDoorNumber = req.sessionModel.get<{
      doorNumber: string
      reasonForChange: string
    }>('changeDoorNumber')

    if (changeDoorNumber) {
      const { doorNumber, reasonForChange } = changeDoorNumber
      const location = await locationsService.updateCellMark(systemToken, res.locals.locationId, {
        cellMark: doorNumber,
        reasonForChange,
      })
      id = location.pendingApprovalRequestId
    } else {
      const certificationApprovalRequest = await locationsService.createCertificationRequestForLocation(
        systemToken,
        'DRAFT',
        res.locals.locationId,
      )
      id = certificationApprovalRequest.id
    }

    const url = `${ingressUrl}/${prisonId}/cell-certificate/change-requests/${id}`

    const proposedSignedOpCapChange = req.sessionModel.get<{
      signedOperationalCapacity: number
      reasonForChange: string
    }>('proposedSignedOpCapChange')
    if (proposedSignedOpCapChange) {
      const { signedOperationalCapacity, reasonForChange } = proposedSignedOpCapChange
      await locationsService.createCertificationRequestForSignedOpCap(
        systemToken,
        prisonId,
        signedOperationalCapacity,
        reasonForChange,
      )
    }

    // Send notifications to both sets of relevant cert roles
    const [requestReceivedAddresses, requestSubmittedEmails] = await Promise.all([
      getUserEmails(manageUsersService, systemToken, res.locals.prisonId, notificationGroups.requestReceivedUsers),
      getUserEmails(manageUsersService, systemToken, res.locals.prisonId, notificationGroups.requestSubmittedUsers),
    ])

    const notifications = [
      { emailAddresses: requestReceivedAddresses, type: NotificationType.REQUEST_RECEIVED, url: `${url}/review` },
      { emailAddresses: requestSubmittedEmails, type: NotificationType.REQUEST_SUBMITTED, url },
    ]

    await Promise.all(
      notifications.map(({ emailAddresses, type, url: notificationUrl }) =>
        sendNotification(
          notifyService,
          emailAddresses,
          prisonName,
          notificationUrl,
          type,
          undefined,
          undefined,
          undefined,
          submittedBy,
        ),
      ),
    )

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Change request${proposedSignedOpCapChange ? 's' : ''} sent`,
      content: `You have submitted ${proposedSignedOpCapChange ? '2 requests' : 'a request'} to update the cell certificate.`,
    })

    res.redirect(`/${res.locals.prisonId}/cell-certificate/change-requests`)
  }
}
