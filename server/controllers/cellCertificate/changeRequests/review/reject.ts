import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import capFirst from '../../../../formatters/capFirst'
import displayName from '../../../../formatters/displayName'

export default class Reject extends FormInitialStep {
  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationsService, manageUsersService } = req.services
    const { systemToken } = req.session
    const { approvalRequest, user } = res.locals

    if (approvalRequest.locationId) {
      const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    } else {
      res.locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName
    }

    res.locals.buttonText = 'Reject request'

    res.locals.userMap = {
      [approvalRequest.requestedBy]:
        (await manageUsersService.getUser(user.token, approvalRequest.requestedBy))?.name ||
        approvalRequest.requestedBy,
    }

    res.locals.cancelText = 'Cancel'

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { explanation } = req.form.values
    const { locationsService } = req.services

    await locationsService.rejectCertificationRequest(
      req.session.systemToken,
      res.locals.approvalRequest.id,
      explanation as string,
    )

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Change request rejected`,
      content: `The establishment has been notified that the requested change has been rejected.`,
    })

    res.redirect(`/${res.locals.prisonId}/cell-certificate/change-requests`)
  }
}
