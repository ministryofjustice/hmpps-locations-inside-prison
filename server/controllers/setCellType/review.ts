import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import populateLocation from '../../middleware/populateLocation'
import getLocationAttributesIncludePending from '../../utils/getLocationAttributesIncludePending'
import { TypedLocals } from '../../@types/express'
import canEditCna from '../../utils/canEditCna'
import capFirst from '../../formatters/capFirst'

export default class ReviewCellCapacity extends FormInitialStep {
  override middlewareSetup() {
    this.use(populateLocation({ decorate: true }))
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { certifiedNormalAccommodation, maxCapacity, workingCapacity } = getLocationAttributesIncludePending(
      res.locals.location,
    )

    return {
      'set-cell-type_baselineCna': certifiedNormalAccommodation,
      'set-cell-type_maxCapacity': maxCapacity,
      'set-cell-type_workingCapacity': workingCapacity,
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const occupants = res.locals.prisonerLocation?.prisoners || []

      const validationErrors: FormWizard.Errors = {}

      if (!errors['set-cell-type_maxCapacity']) {
        if (Number(values?.['set-cell-type_maxCapacity']) < occupants.length) {
          validationErrors['set-cell-type_maxCapacity'] = this.formError(
            'set-cell-type_maxCapacity',
            'isNoLessThanOccupancy',
          )
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { prisonConfiguration, decoratedLocation } = res.locals

    if (canEditCna(prisonConfiguration) && decoratedLocation.status === 'DRAFT') {
      locals.buttonText = 'Update cell'
    }

    return {
      ...locals,
      title: 'Review cell capacity',
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }
}
