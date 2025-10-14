import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import BaseController from './baseController'

export default class IsUpdateNeeded extends BaseController {
  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    req.sessionModel.unset('proposedSignedOpCapChange')

    super.saveValues(req, res, next)
  }
}
