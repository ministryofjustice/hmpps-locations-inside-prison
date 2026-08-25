import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { TypedLocals } from '../../@types/express'
import FormStep from '../base/formStep'

export default class NonResidentialConversionWarning extends FormStep {
  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    return {
      cancelClasses: 'govuk-link--inverse',
      buttonText: 'Continue conversion to non-residential room',
      minLayout: 'three-quarters',
    }
  }
}
