import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default class ConfirmCellCapacity extends FormWizard.Controller {
  get(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    res.redirect(`/view-and-update-locations/${location.prisonId}/${location.id}`)
  }
}
