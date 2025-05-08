import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { Location } from '../../data/types/locationsApi'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'

export default class ChangeCellCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
  }

  getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
    return res.locals.location.capacity
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { location } = res.locals
      const { accommodationTypes, specialistCellTypes }: Location = location.raw
      const occupants = res.locals.prisonerLocation?.prisoners || []

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
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const { maxCapacity: newMaxCap, workingCapacity: newWorkingCap } = req.form.values
    const { maxCapacity, workingCapacity } = location.capacity

    if (
      (!req.canAccess('change_max_capacity') || Number(newMaxCap) === maxCapacity) &&
      Number(newWorkingCap) === workingCapacity
    ) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
    const locals = super.locals(req, res)
    const { id: locationId, prisonId } = res.locals.location

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
