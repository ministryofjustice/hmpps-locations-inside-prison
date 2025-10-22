import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import { Location } from '../../../data/types/locationsApi'
import populateLocationTree from './middleware/populateLocationTree'
import getLocationResidentialSummary from './middleware/getLocationResidentialSummary'
import { TypedLocals } from '../../../@types/express'
import capFirst from '../../../formatters/capFirst'

export default class ReactivateParentCheckCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.resetCapacity)
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(true))
  }

  resetCapacity(req: FormWizard.Request, _res: Response, next: NextFunction) {
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

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
    const isSelect = !!req.sessionModel.get('selectLocations')
    const backLink = isSelect
      ? `/reactivate/parent/${decoratedLocation.id}/select`
      : `/view-and-update-locations/${[decoratedLocation.prisonId, decoratedLocation.id].join('/')}`
    const { decoratedCells, errorlist } = res.locals

    res.locals.options.fields = Object.fromEntries(
      errorlist.map(error => {
        const [locationId, fieldName] = error.key.split('_')
        const cell = decoratedCells.find(c => c.id === locationId)

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
      cancelText: 'Cancel',
      title: 'Check capacity of cells',
      titleCaption: capFirst(decoratedLocation.displayName),
      minLayout: 'one-half',
    }
  }

  override getErrors(req: FormWizard.Request, _res: Response) {
    return req.sessionModel.get('errors')
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { decoratedCells } = res.locals
      const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get(
        'capacityChanges',
      ) || {}) as typeof capacityChanges

      const validationErrors: FormWizard.Errors = {}

      decoratedCells.forEach(cell => {
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
