import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'

export default class DeactivateTemporaryOccupied extends FormInitialStep {
  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { id: locationId, prisonId } = res.locals.location

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
    }
  }
}
