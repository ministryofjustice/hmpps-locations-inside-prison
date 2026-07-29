import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'

export default class CellConversionSetCellCapacity extends FormStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    return {
      ...super.locals(req, res),
      insetText:
        'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { sessionModel } = req
      const { values } = req.form
      const accommodationType = sessionModel.get<string>('accommodationType')
      const specialistCellTypes = sessionModel.get<string>('specialistCellTypes')

      const validationErrors: FormWizard.Errors = {}

      if (
        !errors.workingCapacity &&
        values?.workingCapacity === '0' &&
        accommodationType === 'NORMAL_ACCOMMODATION' &&
        !specialistCellTypes?.length
      ) {
        validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
      }

      callback({ ...errors, ...validationErrors })
    })
  }
}
