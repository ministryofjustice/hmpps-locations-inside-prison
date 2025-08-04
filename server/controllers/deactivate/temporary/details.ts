import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'
import populateDeactivationReasonItems from '../../../middleware/populateDeactivationReasonItems'

export default class DeactivateTemporaryDetails extends FormInitialStep {
  override middlewareSetup() {
    this.use(populateDeactivationReasonItems)
    super.middlewareSetup()
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    req.form.values.deactivationReasonDescription =
      req.body[`deactivationReasonDescription-${req.form.values.deactivationReason}`]
    super.validateFields(req, res, callback)
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)

    const { id: locationId, prisonId } = res.locals.decoratedLocation

    const cancelLink = `/view-and-update-locations/${prisonId}/${locationId}`

    return {
      ...locals,
      backLink: res.locals.backLink || cancelLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
