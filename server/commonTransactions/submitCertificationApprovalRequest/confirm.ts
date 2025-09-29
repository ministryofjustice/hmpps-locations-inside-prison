import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'

import validateEmails from '../../utils/validateEmails'
import { Location } from '../../data/types/locationsApi'
import { PaginatedUsers } from '../../data/manageUsersApiClient'
import { NotificationDetails, NotificationType } from '../../services/notificationService'

async function getAllLocations(req: FormWizard.Request, location: Location) {
  const locations: Location[] = []

  locations.push(location)

  if (!location.leafLevel) {
    const locationSummary = await req.services.locationsService.getResidentialSummary(
      req.session.systemToken,
      location.prisonId,
      location.id,
    )
    locations.push(
      ...(
        await Promise.all(
          locationSummary.subLocations.map((subLocation: Location) => getAllLocations(req, subLocation)),
        )
      ).flat(),
    )
  }

  return locations
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
      locations: await getAllLocations(req, res.locals.location),
    })

    if (proposedSignedOpCapChange) {
      proposedCertificationApprovalRequests.push({
        approvalType: 'SIGNED_OP_CAP',
        prisonId: proposedSignedOpCapChange.prisonId,
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
    const { systemToken } = req.session
    const { locationsService, manageUsersService, notifyService } = req.services
    const { prisonName } = res.locals.prisonResidentialSummary.prisonSummary
    const submittedBy = res.locals.user.username

    await locationsService.createCertificationRequestForLocation(systemToken, 'DRAFT', res.locals.locationId)

    const proposedSignedOpCapChange = req.sessionModel.get<{
      prisonId: string
      signedOperationalCapacity: number
      reasonForChange: string
    }>('proposedSignedOpCapChange')
    if (proposedSignedOpCapChange) {
      const { prisonId, signedOperationalCapacity, reasonForChange } = proposedSignedOpCapChange
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

    const details: NotificationDetails = {
      // emailAddress: opCapEmailAddresses,
      emailAddress: ['ashley.gyngell@justice.gov.uk', 'dafydd.houston@justice.gov.uk'],
      establishment: prisonName,
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

    res.redirect(`/view-and-update-locations/${res.locals.prisonId}/${res.locals.locationId}`)
  }
}
