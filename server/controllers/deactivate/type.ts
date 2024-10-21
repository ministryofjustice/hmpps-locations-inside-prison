import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'

export default class DeactivateType extends FormInitialStep {
  locals(req: FormWizard.Request, res: Response): object {
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      backLink: cancelLink,
      cancelLink,
    }
  }
}
