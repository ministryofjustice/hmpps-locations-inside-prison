import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import { getAllCertUserEmails, sendNotification } from '../../../../utils/notificationHelpers'
import { NotificationType } from '../../../../services/notificationService'
import config from '../../../../config'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'
import conditionallyPopulatePrisoners from './conditionallyPopulatePrisoners'
import approvalCellWouldBeOvercrowded from '../../../../routes/cellCertificate/changeRequests/review/approvalCellWouldBeOvercrowded'

export default class Approve extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCertificationRequestDetails)
    this.use(conditionallyPopulatePrisoners)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { approvalRequest } = res.locals

    res.locals.buttonText = 'Update cell certificate'

    if (approvalRequest.approvalType === 'SIGNED_OP_CAP') {
      const confirmationField = req.form.options.fields.confirmation
      confirmationField.fieldset.legend.text = 'Confirm change agreed with capacity management'
      confirmationField.hint = {
        text: 'I confirm that this change has been agreed with capacity management.',
      }
      confirmationField.errorMessages = {
        required: 'Confirm that the change has been agreed with capacity management',
      }
    }

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (approvalCellWouldBeOvercrowded(req, res)) {
      next()
      return
    }

    const { ingressUrl } = config
    const { systemToken } = req.session
    const { locationsService, manageUsersService, notifyService } = req.services
    const { approvalRequest, notificationDetails, prisonId } = res.locals

    const certification = await locationsService.approveCertificationRequest(systemToken, approvalRequest.id)
    const url = `${ingressUrl}/${prisonId}/cell-certificate/${certification.certificateId}`

    // Don't send emails in local dev (every deployed env counts as production)
    if (config.production || process.env.NODE_ENV === 'test') {
      // Send notifications to all cert roles
      const emailAddresses = await getAllCertUserEmails(manageUsersService, systemToken, prisonId)

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
