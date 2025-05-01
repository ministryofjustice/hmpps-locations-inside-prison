import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import protectRoute from '../../../middleware/protectRoute'

export default class DeactivatePermanentWarning extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(protectRoute('deactivate:permanent'))
  }

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      backLink: res.locals.backLink || cancelLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
