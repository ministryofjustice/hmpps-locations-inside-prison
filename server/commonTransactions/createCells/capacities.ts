import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'

export default class Capacities extends BaseController {
  override locals(req: FormWizard.Request, res: Response) {
    const locals = super.locals(req, res)

    locals.insetText = 'This is the actual number written on the cell door. It may be different to the cell number.'

    return locals
  }
}
