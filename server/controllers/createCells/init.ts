import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import paths from '../../utils/paths'

export default class CreateCellsInit extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals.decoratedResidentialSummary

    if (location.pendingApprovalRequestId) {
      res.redirect(paths.location.view(location))
      return
    }

    req.sessionModel.set('localName', location.localName)
    req.sessionModel.set('locationType', location.locationType)
    req.sessionModel.set('locationId', location.id)

    super.successHandler(req, res, next)
  }
}
