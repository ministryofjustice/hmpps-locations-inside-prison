import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'

export default class ReactivateCellInit extends FormInitialStep {
  render(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { ref, refPrisonId, refLocationId } = req.query

    req.sessionModel.set('referrerFlow', ref)
    req.sessionModel.set('referrerPrisonId', refPrisonId)
    req.sessionModel.set('referrerLocationId', refLocationId)

    this.successHandler(req, res, next)
  }
}
