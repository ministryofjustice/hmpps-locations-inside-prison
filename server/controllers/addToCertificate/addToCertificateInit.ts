import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class AddToCertificateInit extends FormInitialStep {
  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    // req.sessionModel.set('proposedLocationToCertify', res.locals.locationId)

    super.saveValues(req, res, next)
  }
}
