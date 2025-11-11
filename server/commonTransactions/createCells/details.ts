import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'

export default class Details extends BaseController {
  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    // If any of the values have changed, the user must go through the rest of the transaction (no longer editing)
    if (req.isEditing) {
      const prefix = Object.keys(req.body)
        .find(k => k.endsWith('cellsToCreate'))
        .replace('cellsToCreate', '')
      if (
        req.body[`${prefix}cellsToCreate`] !== req.sessionModel.get(`${prefix}cellsToCreate`) ||
        req.body[`${prefix}accommodationType`] !== req.sessionModel.get(`${prefix}accommodationType`)
      ) {
        req.isEditing = false
      }
    }

    super.saveValues(req, res, next)
  }
}
