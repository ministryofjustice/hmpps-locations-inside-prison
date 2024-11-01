import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import { Location } from '../../../data/types/locationsApi'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'
import populateLocations from './middleware/populateLocations'
import getLocationResidentialSummary from './middleware/getLocationResidentialSummary'

export default class ReactivateParentCheckCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.resetCapacity)
    this.use(getLocationResidentialSummary)
    this.use(populateLocations(true))
  }

  resetCapacity(req: FormWizard.Request, res: Response, next: NextFunction) {
    req.sessionModel.unset('workingCapacity')
    req.sessionModel.unset('maxCapacity')
    req.sessionModel.unset('errorValues')

    const errors: { workingCapacity: FormWizard.Controller.Error; maxCapacity: FormWizard.Controller.Error } =
      req.sessionModel.get('errors')
    if (errors) {
      delete errors.workingCapacity
      delete errors.maxCapacity
    }

    next()
  }

  locals(req: FormWizard.Request, res: Response) {
    const { location } = res.locals
    const isSelect = !!req.sessionModel.get('selectLocations')
    const backLink = isSelect
      ? `/reactivate/parent/${location.id}/select`
      : `/view-and-update-locations/${[location.prisonId, location.id].join('/')}`
    const { cells, errorlist }: { cells: Location[]; errorlist: FormWizard.Controller.Error[] } = res.locals as any

    res.locals.options.fields = Object.fromEntries(
      errorlist.map(error => {
        const [locationId, fieldName] = error.key.split('_')
        const cell = cells.find(c => c.id === locationId)

        return [
          error.key,
          {
            errorMessages: {
              error: `Change the ${fieldName} capacity of ${cell?.pathHierarchy}`,
            },
            id: locationId,
          },
        ]
      }),
    )

    return {
      ...super.locals(req, res),
      backLink,
      cancelLink: backLink,
    }
  }

  getErrors(req: FormWizard.Request, res: Response) {
    return req.sessionModel.get('errors')
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, errors => {
      const { cells }: { cells: DecoratedLocation[] } = res.locals as any
      const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get(
        'capacityChanges',
      ) || {}) as typeof capacityChanges

      const validationErrors: any = {}

      cells.forEach(cell => {
        const { accommodationTypes, specialistCellTypes } = cell.raw
        const locationCapacityChanges = capacityChanges[cell.id] || {}
        const workingCapacity =
          'workingCapacity' in locationCapacityChanges
            ? locationCapacityChanges.workingCapacity
            : cell.oldWorkingCapacity
        const maxCapacity =
          'maxCapacity' in locationCapacityChanges ? locationCapacityChanges.maxCapacity : cell.capacity.maxCapacity

        if (
          workingCapacity === 0 &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors[`${cell.id}_workingCapacity`] = this.formError(`${cell.id}_working`, 'error')
        } else if (maxCapacity > 99) {
          validationErrors[`${cell.id}_workingCapacity`] = this.formError(`${cell.id}_working`, 'error')
        } else if (workingCapacity > maxCapacity) {
          validationErrors[`${cell.id}_workingCapacity`] = this.formError(`${cell.id}_working`, 'error')
        }

        if (maxCapacity < 0) {
          validationErrors[`${cell.id}_maxCapacity`] = this.formError(`${cell.id}_maximum`, 'error')
        } else if (maxCapacity > 99) {
          validationErrors[`${cell.id}_maxCapacity`] = this.formError(`${cell.id}_maximum`, 'error')
        }
      })

      callback({ ...errors, ...validationErrors })
    })
  }
}
