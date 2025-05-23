import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import { TypedLocals } from '../../@types/express'

export default class ChangeCellCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
  }

  getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
    return res.locals.decoratedLocation.capacity
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { decoratedLocation, prisonerLocation } = res.locals
      const { accommodationTypes, specialistCellTypes } = decoratedLocation.raw
      const occupants = prisonerLocation?.prisoners || []

      const validationErrors: FormWizard.Errors = {}

      if (!errors.workingCapacity) {
        if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        } else if (Number(values?.workingCapacity) < occupants.length) {
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

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { maxCapacity: newMaxCap, workingCapacity: newWorkingCap } = req.form.values
    const { maxCapacity, workingCapacity } = decoratedLocation.capacity

    if (Number(newMaxCap) === maxCapacity && Number(newWorkingCap) === workingCapacity) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { id: locationId, prisonId } = res.locals.decoratedLocation

    const cancelLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/location/${locationId}/change-cell-capacity/confirm`,
    })

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
    }
  }
}
