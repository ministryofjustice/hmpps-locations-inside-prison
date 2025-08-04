import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class BaseController extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary } = res.locals
    const localName = req.sessionModel.get<string>('localName')
    const locationName =
      localName ||
      `${decoratedResidentialSummary.location.pathHierarchy}-${req.sessionModel.get<string>('locationCode')}`
    locals.locationType = req.sessionModel.get<string>('locationType')
    locals.titleCaption = `Create cells on ${locals.locationType.toLowerCase()} ${locationName}`

    return locals
  }
}
