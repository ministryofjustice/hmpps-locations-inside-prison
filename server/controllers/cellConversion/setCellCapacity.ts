import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class CellConversionSetCellCapacity extends FormInitialStep {
  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    return {
      ...locals,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
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
