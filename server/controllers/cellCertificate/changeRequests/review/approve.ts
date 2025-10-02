import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../../base/formInitialStep'
import capFirst from '../../../../formatters/capFirst'
import displayName from '../../../../formatters/displayName'

export default class Approve extends FormInitialStep {
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

    await super._locals(req, res, next)
  }

  override async saveValues(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { locationsService } = req.services

    await locationsService.approveCertificationRequest(req.session.systemToken, res.locals.approvalRequest.id)

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Cell certificate updated`,
      content: `The establishment has been notified that the change request has been approved.`,
    })

    res.redirect(`/${res.locals.prisonId}/cell-certificate/change-requests`)
  }
}
