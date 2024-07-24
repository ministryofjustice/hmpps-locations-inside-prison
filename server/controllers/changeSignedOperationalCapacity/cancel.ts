import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default class CancelChangeSignedOperationalCapacity extends FormWizard.Controller {
  get(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals
    res.redirect(`/view-and-update-locations/${prisonId}`)
  }
}
