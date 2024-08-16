import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default class NonResidentialConversionWarning extends FormWizard.Controller {
  locals(_req: FormWizard.Request, res: Response): Record<string, any> {
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    return {
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
