import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import protectRoute from '../../../middleware/protectRoute'
import { TypedLocals } from '../../../@types/express'

export default class DeactivatePermanentDetails extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(protectRoute('deactivate:permanent'))
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)

    const { id: locationId, prisonId } = res.locals.decoratedLocation

    return {
      ...locals,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
