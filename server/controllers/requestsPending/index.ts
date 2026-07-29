import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default class RequestsPending extends FormStep {
  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    return {
      changeRequestsLink: paths.cellCertificate.changeRequest.view(res.locals.prisonId),
    }
  }
}
