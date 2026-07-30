import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../../controllers/base/formStep'

export default class RemoveCellType extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { sessionModel } = req
    const { cellId } = req.params

    sessionModel.unset(`temp-cellTypes${cellId}`)
    sessionModel.set(`temp-cellTypes${cellId}-removed`, true)

    super.successHandler(req, res, next)
  }
}
