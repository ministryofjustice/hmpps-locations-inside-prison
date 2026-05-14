import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'

export default class TemporaryInactiveInit extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    req.sessionModel.set('reduceWorkingCapacity', 'YES')

    return super.successHandler(req, res, next)
  }
}
