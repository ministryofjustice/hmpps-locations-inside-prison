import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import { getUserEmails, sendNotification } from '../../../utils/notificationHelpers'
import { NotificationType, notificationGroups } from '../../../services/notificationService'
import formatDateWithTime from '../../../formatters/formatDateWithTime'
import populateCertificationRequestDetails from '../../../middleware/populateCertificationRequestDetails'
import config from '../../../config'

export default class Withdraw extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCertificationRequestDetails)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    res.locals.buttonText = 'Confirm withdrawal'
    res.locals.cancelText = 'Cancel'

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService, notifyService, manageUsersService } = req.services
    const { explanation } = req.form.values
    const { prisonId, notificationDetails } = res.locals
    const { prisonName, locationName, changeType, requestedBy, requestedDate } = notificationDetails
    const { id: requestId, locationId } = res.locals.approvalRequest

    await locationsService.withdrawCertificationRequest(systemToken, requestId, explanation as string)

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
        NotificationType.REQUEST_WITHDRAWN,
        locationName,
        changeType,
        formatDateWithTime(requestedDate),
        requestedBy,
        res.locals.user.name,
        explanation as string,
      )
    }

    req.journeyModel.reset()
    req.sessionModel.reset()

    let bannerLocationText: string
    if (locationId) {
      const location = await locationsService.getLocation(systemToken, locationId)
      bannerLocationText = `${location.locationType.toLowerCase()} ${location.localName || location.pathHierarchy}`
    } else {
      bannerLocationText = prisonName
    }

    req.flash('success', {
      title: `Change request withdrawn`,
      content: `You have withdrawn the change request for ${bannerLocationText}.`,
    })

    res.redirect(`/${prisonId}/cell-certificate/change-requests`)
  }
}
