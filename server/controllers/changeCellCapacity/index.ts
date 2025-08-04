import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class ChangeCellCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    return res.locals.decoratedLocation.capacity
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    const { values } = req.form
    const { decoratedLocation, prisonerLocation } = res.locals
    const { accommodationTypes, specialistCellTypes } = decoratedLocation.raw
    const occupants = prisonerLocation?.prisoners || []

    const validationErrors: FormWizard.Errors = {}

    if (!req.canAccess('change_max_capacity')) {
      values.maxCapacity = decoratedLocation.capacity.maxCapacity.toString()
    }

    super.validateFields(req, res, errors => {
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

  override validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { maxCapacity: newMaxCap, workingCapacity: newWorkingCap } = req.form.values
    const { maxCapacity, workingCapacity } = decoratedLocation.capacity

    if (
      (!req.canAccess('change_max_capacity') || Number(newMaxCap) === maxCapacity) &&
      Number(newWorkingCap) === workingCapacity
    ) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation, values } = res.locals
    const { capacity, displayName, id: locationId, prisonId } = decoratedLocation

    const cancelLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/location/${locationId}/change-cell-capacity/confirm`,
    })

    const { maxCapacity } = capacity

    if (!req.canAccess('change_max_capacity')) {
      req.sessionModel.set('maxCapacity', maxCapacity)
      values.maxCapacity = maxCapacity
    }

    return {
      ...locals,
      backLink: cancelLink,
      cancelLink,
      title: `Change ${req.canAccess('change_max_capacity') ? 'cell' : 'working'} capacity`,
      insetText:
        'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
      titleCaption: capFirst(displayName),
    }
  }
}
