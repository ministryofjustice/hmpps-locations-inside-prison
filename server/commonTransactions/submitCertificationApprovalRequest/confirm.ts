import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'
import validateEmails from '../../utils/validateEmails'
import { Location } from '../../data/types/locationsApi'
import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'
import { PaginatedUsers } from '../../data/manageUsersApiClient'
import { NotificationDetails, NotificationType } from '../../services/notificationService'
import config from '../../config'

async function locationToCertificationLocation(
  req: FormWizard.Request,
  location: Location,
): Promise<CertificateLocation> {
  const certificationLocation: CertificateLocation = {
    id: location.id,
    locationCode: location.code,
    pathHierarchy: location.pathHierarchy,
    level: location.level,
    certifiedNormalAccommodation: location.pendingChanges.certifiedNormalAccommodation,
    workingCapacity: location.pendingChanges.workingCapacity,
    maxCapacity: location.pendingChanges.maxCapacity,
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

  override locals(_req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(_req, res)

    locals.buttonText = 'Submit for approval'

    return locals
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

    proposedCertificationApprovalRequests.push({
      approvalType: 'DRAFT',
      locations: [await locationToCertificationLocation(req, locals.location)],
    })

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
    const submittedBy = res.locals.user.username

    const certificationApprovalRequest = await locationsService.createCertificationRequestForLocation(
      systemToken,
      'DRAFT',
      res.locals.locationId,
    )

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

    const usersWithOpCapRole: PaginatedUsers = await manageUsersService.getAllUsersByCaseload(
      req.session.systemToken,
      res.locals.prisonId,
      'MANAGE_RES_LOCATIONS_OP_CAP',
    )

    const opCapEmailAddresses = validateEmails(usersWithOpCapRole.content)
    const reviewUrl = `${ingressUrl}/${prisonId}/cell-certificate/change-requests/${certificationApprovalRequest.id}/review`

    const details: NotificationDetails = {
      emailAddress: opCapEmailAddresses,
      establishment: prisonName,
      url: reviewUrl,
      type: NotificationType.REQUEST_RECEIVED,
      submittedBy,
    }

    await notifyService.notify(details)
    // Check when sendChangeRequestSubmittedEmails also needs to be sent

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Change request${proposedSignedOpCapChange ? 's' : ''} sent`,
      content: `You have submitted ${proposedSignedOpCapChange ? '2 requests' : 'a request'} to update the cell certificate.`,
    })

    res.redirect(`/${res.locals.prisonId}/cell-certificate/change-requests`)
  }
}
