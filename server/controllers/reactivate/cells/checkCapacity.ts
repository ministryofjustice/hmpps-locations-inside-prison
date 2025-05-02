import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import populateCells from './populateCells'
import { Location } from '../../../data/types/locationsApi'

export default class ReactivateCellsCheckCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(populateCells)
    this.use(this.resetCapacity)
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
    const referrerPrisonId = req.sessionModel.get('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get('referrerLocationId')
    const backLink = `/inactive-cells/${[referrerPrisonId, referrerLocationId].filter(i => i).join('/')}`
    const { cells, errorlist } = res.locals as unknown as {
      cells: Location[]
      errorlist: FormWizard.Controller.Error[]
    }

    res.locals.options.fields = Object.fromEntries(
      errorlist.map(error => {
        const [locationId, fieldName] = error.key.split('_')
        const location = cells.find(c => c.id === locationId)

        return [
          error.key,
          {
            errorMessages: {
              error: `Change the ${fieldName} capacity of ${location?.pathHierarchy}`,
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

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { cells } = res.locals as unknown as { cells: Location[] }
      const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get(
        'capacityChanges',
      ) || {}) as typeof capacityChanges

      const validationErrors: FormWizard.Errors = {}

      cells.forEach(location => {
        const { accommodationTypes, specialistCellTypes }: Location = location
        const locationCapacityChanges = capacityChanges[location.id] || {}
        const workingCapacity =
          'workingCapacity' in locationCapacityChanges
            ? locationCapacityChanges.workingCapacity
            : location.oldWorkingCapacity
        const maxCapacity =
          'maxCapacity' in locationCapacityChanges ? locationCapacityChanges.maxCapacity : location.capacity.maxCapacity

        if (
          workingCapacity === 0 &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors[`${location.id}_workingCapacity`] = this.formError(`${location.id}_working`, 'error')
        } else if (maxCapacity > 99) {
          validationErrors[`${location.id}_workingCapacity`] = this.formError(`${location.id}_working`, 'error')
        } else if (workingCapacity > maxCapacity) {
          validationErrors[`${location.id}_workingCapacity`] = this.formError(`${location.id}_working`, 'error')
        }

        if (maxCapacity < 0) {
          validationErrors[`${location.id}_maxCapacity`] = this.formError(`${location.id}_maximum`, 'error')
        } else if (maxCapacity > 99) {
          validationErrors[`${location.id}_maxCapacity`] = this.formError(`${location.id}_maximum`, 'error')
        }
      })

      callback({ ...errors, ...validationErrors })
    })
  }
}
