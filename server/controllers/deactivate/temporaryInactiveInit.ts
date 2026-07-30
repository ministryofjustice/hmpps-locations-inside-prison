import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../base/formStep'
import paths from '../../utils/paths'

export default class TemporaryInactiveInit extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (!req.canAccess('certificate_change_request_create')) {
      res.redirect(paths.location.view(res.locals.decoratedLocation))
      return null
    }

    req.sessionModel.set('reduceWorkingCapacity', 'YES')

    return super.successHandler(req, res, next)
  }
}
