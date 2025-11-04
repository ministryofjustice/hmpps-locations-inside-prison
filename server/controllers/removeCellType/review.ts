import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import populateLocation from '../../middleware/populateLocation'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class ReviewCellCapacity extends FormInitialStep {
  override middlewareSetup() {
    this.use(populateLocation({ decorate: true }))
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
  }

  override getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
    return res.locals.decoratedLocation.capacity
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const occupants = res.locals.prisonerLocation?.prisoners || []

      const validationErrors: FormWizard.Errors = {}

      if (!errors.maxCapacity) {
        if (Number(values?.maxCapacity) < occupants.length) {
          validationErrors.maxCapacity = this.formError('maxCapacity', 'isNoLessThanOccupancy')
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals

    return {
      ...super.locals(req, res),
      title: 'Review cell capacity',
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }
}
