import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../../controllers/base/formInitialStep'

export default class BaseController extends FormInitialStep {
  getCellPath(_req: FormWizard.Request, res: Response) {
    return res.locals.decoratedLocation.pathHierarchy
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    locals.titleCaption = `Cell ${this.getCellPath(req, res)}`

    return locals
  }
}
