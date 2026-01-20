import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import { getUserEmails, sendNotification } from '../../../../utils/notificationHelpers'
import { NotificationType, notificationGroups } from '../../../../services/notificationService'
import formatDateWithTime from '../../../../formatters/formatDateWithTime'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'
import addConstantToLocals from '../../../../middleware/addConstantToLocals'
import addLocationsToLocationMap from '../../../../middleware/addLocationsToLocationMap'
import config from '../../../../config'

export default class Reject extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCertificationRequestDetails)
    this.use(addConstantToLocals('locationTypes'))
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    res.locals.buttonText = 'Reject request'
    res.locals.cancelText = 'Cancel'
    const { approvalRequest } = res.locals
    if (approvalRequest.approvalType === 'DEACTIVATION') {
      await addLocationsToLocationMap([approvalRequest.locationId])(req, res, null)
    }

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { explanation } = req.form.values
    const { locationsService, notifyService, manageUsersService } = req.services
    const { systemToken } = req.session
    const { prisonId, notificationDetails } = res.locals
    const { prisonName, requestedBy, locationName, changeType, requestedDate } = notificationDetails

    await locationsService.rejectCertificationRequest(
      req.session.systemToken,
      res.locals.approvalRequest.id,
      explanation as string,
    )

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
        prisonName,
        undefined,
        NotificationType.REQUEST_REJECTED,
        locationName,
        changeType,
        formatDateWithTime(requestedDate),
        requestedBy,
        undefined,
        undefined,
        res.locals.user.name,
        explanation as string,
      )
    }

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Change request rejected`,
      content: `The establishment has been notified that the requested change has been rejected.`,
    })

    res.redirect(`/${res.locals.prisonId}/cell-certificate/change-requests`)
  }
}
