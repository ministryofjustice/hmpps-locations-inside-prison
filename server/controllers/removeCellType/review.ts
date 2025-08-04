import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import populateLocation from '../../middleware/populateLocation'

export default class ReviewCellCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
    this.use(populateLocation({ decorate: true }))
  }

  override getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
    return res.locals.decoratedLocation.capacity
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const occupants = res.locals.prisonerLocation?.prisoners || []

      const validationErrors: FormWizard.Errors = {}

      if (!errors.workingCapacity) {
        if (Number(values?.workingCapacity) < occupants.length) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'isNoLessThanOccupancy')
        }
      }

      if (!errors.maxCapacity) {
        if (Number(values?.maxCapacity) < occupants.length) {
          validationErrors.maxCapacity = this.formError('maxCapacity', 'isNoLessThanOccupancy')
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  override locals(req: FormWizard.Request, res: Response) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    return {
      ...super.locals(req, res),
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
