import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class CreateCellsInit extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals.decoratedResidentialSummary

    if (location.pendingApprovalRequestId) {
      res.redirect(`/view-and-update-locations/${location.prisonId}/${location.id}`)
      return
    }

    req.sessionModel.set('localName', location.localName)
    req.sessionModel.set('locationType', location.locationType)
    req.sessionModel.set('locationId', location.id)

    super.successHandler(req, res, next)
  }
}
