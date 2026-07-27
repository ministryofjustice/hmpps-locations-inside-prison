import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../../base/formStep'
import populateDeactivationReasonItems from '../../../middleware/populateDeactivationReasonItems'

export default class DeactivateTemporaryDetails extends FormStep {
  override middlewareSetup() {
    this.use(populateDeactivationReasonItems)
    super.middlewareSetup()
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { decoratedLocation } = res.locals
    const { deactivatedReason } = decoratedLocation.raw

    let descriptionFieldKey: string
    if (deactivatedReason === 'OTHER') {
      descriptionFieldKey = 'Other'
    } else {
      descriptionFieldKey = `Description-${deactivatedReason}`
    }

    return {
      deactivationReason: deactivatedReason,
      [`deactivationReason${descriptionFieldKey}`]: decoratedLocation.deactivationReasonDescription,
      estimatedReactivationDate: decoratedLocation.proposedReactivationDate,
      mandatoryEstimatedReactivationDate: decoratedLocation.proposedReactivationDate,
      planetFmReference: decoratedLocation.planetFmReference,
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    req.form.values.deactivationReasonDescription =
      req.body[`deactivationReasonDescription-${req.form.values.deactivationReason}`]
    super.validateFields(req, res, callback)
  }
}
