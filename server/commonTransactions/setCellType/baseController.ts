import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import { TypedLocals } from '../../@types/express'
import FormStep from '../../controllers/base/formStep'

export default class BaseController extends FormStep {
  getCellPath(_req: FormWizard.Request, res: Response) {
    return res.locals.decoratedLocation.pathHierarchy
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    locals.titleCaption = `Cell ${this.getCellPath(req, res)}`

    return locals
  }
}
