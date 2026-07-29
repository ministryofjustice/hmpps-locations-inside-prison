import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../../base/formStep'

export default class ReactivateCellInit extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { ref, refPrisonId, refLocationId } = req.query

    req.sessionModel.set('referrerFlow', ref)
    req.sessionModel.set('referrerPrisonId', refPrisonId)
    req.sessionModel.set('referrerLocationId', refLocationId)

    super.successHandler(req, res, next)
  }
}
