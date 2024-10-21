import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import protectRoute from '../../../middleware/protectRoute'

export default class DeactivatePermanentDetails extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(protectRoute('deactivate:permanent'))
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)

    const { id: locationId, prisonId } = res.locals.location

    return {
      ...locals,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
