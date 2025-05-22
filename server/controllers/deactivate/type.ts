import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class DeactivateType extends FormInitialStep {
  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
    }
  }
}
