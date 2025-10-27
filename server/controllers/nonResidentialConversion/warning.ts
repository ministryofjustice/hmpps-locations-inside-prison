import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { TypedLocals } from '../../@types/express'

export default class NonResidentialConversionWarning extends FormWizard.Controller {
  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    return {
      cancelClasses: 'govuk-link--inverse',
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      title: 'You are about to convert this cell to a non-residential room',
      buttonText: 'Continue conversion to non-residential room',
      minLayout: 'three-quarters',
    }
  }
}
