import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import { getAllCertUserEmails, sendNotification } from '../../../../utils/notificationHelpers'
import { NotificationType } from '../../../../services/notificationService'
import formatDateWithTime from '../../../../formatters/formatDateWithTime'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'
import config from '../../../../config'

export default class Reject extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCertificationRequestDetails)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    res.locals.buttonText = 'Reject request'

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
      const emailAddresses = await getAllCertUserEmails(manageUsersService, systemToken, prisonId)

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
