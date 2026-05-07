import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'

export default class ShouldUpdateCert extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setupDynamicFields)
  }

  setupDynamicFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    req.form.options.fields.updateCert.items = [
      {
        text: `Yes, change the certified working capacity to ${req.sessionModel.get<string>('workingCapacity')}`,
        value: 'YES',
      },
      {
        text: `No, keep the certified working capacity as ${res.locals.decoratedLocation.currentCellCertificate.workingCapacity}`,
        value: 'NO',
      },
    ]

    next()
  }
}
