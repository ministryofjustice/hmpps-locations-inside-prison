import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'
import { Location } from '../../data/types/locationsApi'
import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'
import { notificationGroups, NotificationType } from '../../services/notificationService'
import config from '../../config'
import { getUserEmails, sendNotification } from '../../utils/notificationHelpers'
import displayName from '../../formatters/displayName'
import capFirst from '../../formatters/capFirst'
import addConstantToLocals from '../../middleware/addConstantToLocals'
import getLocationCapacity from '../../utils/getLocationCapacity'
import addLocationsToLocationMap from '../../middleware/addLocationsToLocationMap'

async function locationToCertificationLocation(
  req: FormWizard.Request,
  location: Location,
  modifier?: (location: CertificateLocation) => CertificateLocation,
): Promise<CertificateLocation> {
  const { certifiedNormalAccommodation, maxCapacity, workingCapacity } = getLocationCapacity(location)

  let certificationLocation: CertificateLocation = {
    id: location.id,
    locationCode: location.code,
    pathHierarchy: location.pathHierarchy,
    level: location.level,
    certifiedNormalAccommodation,
    workingCapacity,
    maxCapacity,
    currentCertifiedNormalAccommodation: certifiedNormalAccommodation,
    currentWorkingCapacity: workingCapacity,
    currentMaxCapacity: maxCapacity,
    locationType: location.locationType,
    subLocations: [],
    inCellSanitation: location.inCellSanitation,
    cellMark: location.cellMark,
    specialistCellTypes: location.specialistCellTypes,
    accommodationTypes: location.accommodationTypes,
    usedFor: location.usedFor,
  }

  if (modifier) {
    certificationLocation = modifier(certificationLocation)
  }

  if (!location.leafLevel) {
    const locationSummary = await req.services.locationsService.getResidentialSummary(
      req.session.systemToken,
      location.prisonId,
      location.id,
    )

    certificationLocation.subLocations = await Promise.all(
      locationSummary.subLocations.map((subLocation: Location) =>
        locationToCertificationLocation(req, subLocation, modifier),
      ),
    )
  }

  return certificationLocation
}

export default class Confirm extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(populateLocation())
    this.use(
      addConstantToLocals([
        'accommodationTypes',
        'deactivatedReasons',
        'locationTypes',
        'specialistCellTypes',
        'usedForTypes',
      ]),
    )
    this.use(this.generateRequests)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { locationsService } = req.services
    const { systemToken } = req.session

    if (location) {
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    }

    await addLocationsToLocationMap([location])(req, res, null)

    return super._locals(req, res, next)
  }

  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(_req, res)

    locals.buttonText = 'Submit for approval'
    locals.cancelText = 'Cancel'

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

    if (req.form.options.name === 'deactivate') {
      const deactivationReason = req.sessionModel.get<string>('deactivationReason')
      const deactivationReasonDescription = req.sessionModel.get<string>(
        `deactivationReason${deactivationReason === 'OTHER' ? 'Other' : 'Description'}`,
      )

      proposedCertificationApprovalRequests.push({
        approvalType: 'DEACTIVATION',
        deactivatedReason: deactivationReason,
        deactivationReasonDescription,
        locationId: locals.location.id,
        locationKey: locals.location.key,
        planetFmReference: req.sessionModel.get<string>('facilitiesManagementReference'),
        prisonId: locals.prisonId,
        proposedReactivationDate: req.sessionModel.get<string>('mandatoryEstimatedReactivationDate'),
        reasonForChange: req.sessionModel.get<string>('workingCapacityExplanation'),
        workingCapacityChange: -locals.location.capacity.workingCapacity,
        locations: [
          await locationToCertificationLocation(req, locals.location, location => ({
            ...location,
            workingCapacity: 0,
          })),
        ],
      })

      const changeLink = `/location/${locals.location.id}/deactivate/temporary/details/edit`
      locals.changeLinks = {
        deactivatedReason: changeLink,
        proposedReactivationDate: changeLink,
        planetFmReference: changeLink,
        reasonForChange: changeLink,
      }
    } else if (req.form.options.name === 'add-to-certificate') {
      proposedCertificationApprovalRequests.push({
        approvalType: 'DRAFT',
        prisonId: locals.prisonId,
        locations: [await locationToCertificationLocation(req, locals.location)],
      })
    } else if (req.form.options.name === 'change-door-number') {
      const doorNumber = sessionModel.get<string>('doorNumber')
      const explanation = sessionModel.get<string>('explanation')
      proposedCertificationApprovalRequests.push({
        approvalType: 'CELL_MARK',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        locations: [await locationToCertificationLocation(req, locals.location)],
        reasonForChange: explanation,
        currentCellMark: locals.location.cellMark,
        cellMark: doorNumber,
      })

      const changeLink = `/location/${locals.location.id}/change-door-number/details/edit`
      locals.changeLinks = {
        reasonForChange: changeLink,
      }
    }

    if (proposedSignedOpCapChange) {
      proposedCertificationApprovalRequests.push({
        approvalType: 'SIGNED_OP_CAP',
        prisonId: proposedSignedOpCapChange.prisonId,
        currentSignedOperationCapacity: locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
        signedOperationCapacityChange:
          proposedSignedOpCapChange.signedOperationalCapacity -
          locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
        reasonForChange: proposedSignedOpCapChange.reasonForChange,
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
    const { prisonResidentialSummary, user, locationId, location } = res.locals
    const { prisonName } = prisonResidentialSummary.prisonSummary
    const { prisonId } = location
    const submittedBy = user.name
    const { options } = req.form

    let certificationApprovalRequestId: string
    if (options.name === 'deactivate') {
      const reason = req.sessionModel.get<string>('deactivationReason')
      const response = await locationsService.deactivateTemporary(
        req.session.systemToken,
        locationId,
        reason,
        req.sessionModel.get<string>(`deactivationReason${reason === 'OTHER' ? 'Other' : 'Description'}`),
        req.sessionModel.get<string>('mandatoryEstimatedReactivationDate'),
        req.sessionModel.get<string>('facilitiesManagementReference'),
        true,
        req.sessionModel.get<string>('workingCapacityExplanation'),
      )
      certificationApprovalRequestId = response.pendingApprovalRequestId
    } else if (options.name === 'add-to-certificate') {
      certificationApprovalRequestId = (
        await locationsService.createCertificationRequestForLocation(systemToken, 'DRAFT', locationId)
      ).id
    } else if (options.name === 'change-door-number') {
      const doorNumber = req.sessionModel.get<string>('doorNumber')
      const explanation = req.sessionModel.get<string>('explanation')
      certificationApprovalRequestId = (
        await locationsService.updateCellMark(systemToken, res.locals.locationId, {
          cellMark: doorNumber,
          reasonForChange: explanation,
        })
      ).pendingApprovalRequestId
    }
    const url = `${ingressUrl}/${prisonId}/cell-certificate/change-requests/${certificationApprovalRequestId}`

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

    // Don't send emails in local dev (every deployed env counts as production)
    if (config.production || process.env.NODE_ENV === 'test') {
      // Send notifications to both sets of relevant cert roles
      const [requestReceivedAddresses, requestSubmittedEmails] = await Promise.all([
        getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.requestReceivedUsers),
        getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.requestSubmittedUsers),
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
    }

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Change request${proposedSignedOpCapChange ? 's' : ''} sent`,
      content: `You have submitted ${proposedSignedOpCapChange ? '2 requests' : 'a request'} to update the cell certificate.`,
    })

    res.redirect(`/${prisonId}/cell-certificate/change-requests`)
  }
}
