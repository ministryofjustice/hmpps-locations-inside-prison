import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormStep from '../base/formStep'

export default class CellConversionDoorNumber extends FormStep {
  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    return {
      doorNumber: res.locals.decoratedLocation.cellMark,
    }
  }

  override locals(_req: FormWizard.Request, res: Response) {
    return {
      ...super.locals(_req, res),
      insetText: 'This is the actual number written on the cell door. It may be different to the cell number.',
    }
  }
}
