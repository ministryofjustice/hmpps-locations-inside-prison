import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { TypedLocals } from '../../@types/express'

export default class NonResidentialConversionOccupied extends FormWizard.Controller {
  locals(_req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    return {
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
