import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class CellConversionSetCellCapacity extends FormInitialStep {
  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    return {
      ...locals,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, errors => {
      const { sessionModel } = req
      const { values } = req.form
      const accommodationType = sessionModel.get<string>('accommodationType')
      const specialistCellTypes = sessionModel.get<string>('specialistCellTypes')

      const validationErrors: any = {}

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
