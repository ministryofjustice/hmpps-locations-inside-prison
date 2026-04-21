import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'
import getLocationResidentialSummary from '../parent/middleware/getLocationResidentialSummary'
import populateLocationTree from '../parent/middleware/populateLocationTree'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import capFirst from '../../../formatters/capFirst'
import unsetTempValues from '../../../middleware/unsetTempValues'
import populateModifiedLocationMap from './middleware/populateModifiedLocationMap'

export default class CheckCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(unsetTempValues)
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(true))
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(populateModifiedLocationMap)
    this.use(this.resetErrors)
  }

  resetErrors(req: FormWizard.Request, _res: Response, next: NextFunction) {
    req.sessionModel.unset('errorValues')

    const errors: Record<string, FormWizard.Controller.Error> = req.sessionModel.get('errors')
    if (errors) {
      Object.keys(errors).forEach(key => {
        if (
          key.startsWith('workingCapacity-') ||
          key.startsWith('maximumCapacity-') ||
          key.startsWith('baselineCna-')
        ) {
          delete errors[key]
        }
      })
      req.sessionModel.set('errors', errors)
    }

    next()
  }

  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(_req, res)
    const { decoratedLocation } = res.locals

    return {
      ...locals,
      title: `Check capacity of cell${decoratedLocation.leafLevel ? '' : 's'}`,
      titleCaption: capFirst(decoratedLocation.displayName),
      minLayout: 'three-quarters',
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    super.validateFields(req, res, async errors => {
      const { modifiedLocationMap, locationResidentialSummary } = res.locals
      const { accommodationTypes } = locationResidentialSummary.parentLocation

      const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

      const validationErrors: FormWizard.Errors = {}

      // CARE_AND_SEPARATION and HEALTHCARE_INPATIENTS landings allow 0 cna/working cap, so skip this loop for those
      if (
        !accommodationTypes.includes('HEALTHCARE_INPATIENTS') &&
        !accommodationTypes.includes('CARE_AND_SEPARATION')
      ) {
        Object.values(modifiedLocationMap).forEach(cell => {
          const isSpecialistCellType = cell.specialistCellTypes.some(
            type => specialistCellTypes.find(sct => sct.key === type)?.attributes?.affectsCapacity,
          )
          if (isSpecialistCellType) {
            return
          }

          const { id } = cell
          const workingCapacityKey = `workingCapacity-${id}`
          const baselineCnaKey = `baselineCna-${id}`

          if (!errors[workingCapacityKey] && cell.oldWorkingCapacity === 0) {
            validationErrors[workingCapacityKey] = this.formError(workingCapacityKey, 'nonZeroForNormalCell')
          }

          if (!errors[baselineCnaKey] && cell.capacity.certifiedNormalAccommodation === 0) {
            validationErrors[baselineCnaKey] = this.formError(baselineCnaKey, 'nonZeroForNormalCell')
          }
        })

        const workingCapacityErrors = Object.keys(validationErrors).filter(key =>
          key.startsWith('workingCapacity-'),
        ).length
        const baselineCnaErrors = Object.keys(validationErrors).filter(key => key.startsWith('baselineCna-')).length
        if (workingCapacityErrors) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        }

        if (baselineCnaErrors) {
          validationErrors.baselineCna = this.formError('baselineCna', 'nonZeroForNormalCell')
        }
      }

      next({ ...errors, ...validationErrors })
    })
  }
}
