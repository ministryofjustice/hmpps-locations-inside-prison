import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import capFirst from '../../../../formatters/capFirst'
import displayName from '../../../../formatters/displayName'
import { getUserEmails, sendNotification } from '../../../../utils/notificationHelpers'
import { NotificationType, notificationGroups } from '../../../../services/notificationService'
import config from '../../../../config'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'
import addConstantToLocals from '../../../../middleware/addConstantToLocals'
import addLocationsToLocationMap from '../../../../middleware/addLocationsToLocationMap'

export default class Approve extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCertificationRequestDetails)
    this.use(addConstantToLocals('locationTypes'))
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService } = req.services
    const { systemToken } = req.session
    const { approvalRequest } = res.locals

    if (approvalRequest.locationId) {
      const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    } else {
      res.locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName
    }

    res.locals.buttonText = 'Update cell certificate'
    res.locals.cancelText = 'Cancel'
    if (approvalRequest.approvalType === 'DEACTIVATION') {
      await addLocationsToLocationMap([approvalRequest.locationId])(req, res, null)
    }

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { ingressUrl } = config
    const { systemToken } = req.session
    const { locationsService, manageUsersService, notifyService } = req.services
    const { approvalRequest, notificationDetails, prisonId } = res.locals

    const certification = await locationsService.approveCertificationRequest(systemToken, approvalRequest.id)
    const url = `${ingressUrl}/${prisonId}/cell-certificate/${certification.certificateId}`

    // Don't send emails in local dev (every deployed env counts as production)
    if (config.production || process.env.NODE_ENV === 'test') {
      // Send notifications to all cert roles
      const emailAddresses = await getUserEmails(
        manageUsersService,
        systemToken,
        prisonId,
        notificationGroups.allCertUsers,
      )

      await sendNotification(
        notifyService,
        emailAddresses,
        notificationDetails.prisonName,
        url,
        NotificationType.REQUEST_APPROVED,
      )
    }

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Cell certificate updated`,
      content: `The establishment has been notified that the change request has been approved.`,
    })

    res.redirect(`/${prisonId}/cell-certificate/change-requests`)
  }
}
