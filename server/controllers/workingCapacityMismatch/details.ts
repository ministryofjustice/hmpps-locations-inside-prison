import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import getLocationResidentialSummary from '../reactivate/parent/middleware/getLocationResidentialSummary'

export default class DetailsController extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(this.populateItems)
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { certifiedChange } = req.form.options.fields
    certifiedChange.items = [
      { text: 'Change the working capacity to match the certified working capacity', value: 'NO' },
      {
        text: `Request to change the certified working capacity to ${location.capacity.workingCapacity}`,
        value: 'YES',
      },
    ]

    next()
  }

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (req.form.values.certifiedChange === 'YES') {
      req.sessionModel.set('certifiedWorkingCapacity', res.locals.location.capacity.workingCapacity)
    }

    super.saveValues(req, res, next)
  }
}
