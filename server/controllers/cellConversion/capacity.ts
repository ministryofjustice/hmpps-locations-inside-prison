import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import addConstantToLocals from '../../middleware/addConstantToLocals'
import getLocationAttributesIncludePending from '../../utils/getLocationAttributesIncludePending'

const CELL_TYPE_REGEX = /^temp-cellTypes(.+?)(?:-removed)?$/

export default class CellConversionCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(this.fixHistory)
    this.use(this.unsetCellTypeTypes)
  }

  unsetCellTypeTypes(req: FormWizard.Request, res: Response, next: NextFunction) {
    const modelData = req.sessionModel.toJSON()
    Object.keys(modelData)
      .filter(key => key.startsWith('set-cell-type_accommodationType'))
      .forEach(key => req.sessionModel.unset(key))

    next()
  }

  override allowedJourneyStep(req: FormWizard.Request, res: Response, path: string) {
    if (path.endsWith('/edit-capacity/:parentLocationId')) {
      return true
    }

    return super.allowedJourneyStep(req, res, path)
  }

  fixHistory(req: FormWizard.Request, res: Response, next: NextFunction) {
    req.journeyModel.set(
      'history',
      req.journeyModel.get<FormWizard.HistoryStep[]>('history').filter(s => !s.path.includes('set-cell-type')),
    )

    next()
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    return {
      ...super.locals(req, res),
      minLayout: 'three-quarters',
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { cellTypeAction } = req.body
    if (cellTypeAction) {
      const [action, cellId] = cellTypeAction.split('/')

      req.sessionModel.set('temp-capacitiesValues', req.body)

      const suffix = `${action === 'set' ? '/init' : ''}${req.isEditing ? '/edit' : ''}`

      res.redirect(`/location/${res.locals.decoratedLocation.id}/cell-conversion/${action}-cell-type${suffix}`)

      return
    }

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
          const { id } = cell

          const workingCapacityKey = `workingCapacity-${id}`
          const baselineCnaKey = `baselineCna-${id}`
          const isSpecialistCellType = cell.specialistCellTypes.some(
            type => specialistCellTypes.find(sct => sct.key === type)?.attributes?.affectsCapacity,
          )

          if (!errors[workingCapacityKey] && cell.oldWorkingCapacity === 0 && !isSpecialistCellType) {
            validationErrors[workingCapacityKey] = this.formError(workingCapacityKey, 'nonZeroForNormalCell')
          }

          if (!errors[baselineCnaKey] && cell.capacity.certifiedNormalAccommodation === 0 && !isSpecialistCellType) {
            validationErrors[baselineCnaKey] = this.formError(baselineCnaKey, 'nonZeroForNormalCell')
          }
        })
      }

      next({ ...errors, ...validationErrors })
    })
  }

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    super.saveValues(req, res, () => {})

    const modelData = req.sessionModel.toJSON()
    Object.entries(modelData)
      .filter(([key]) => CELL_TYPE_REGEX.test(key))
      .forEach(([key, data]) => {
        const cellId = key.match(CELL_TYPE_REGEX)[1]
        req.sessionModel.unset(key)

        if (key.endsWith('-removed')) {
          // Remove the saved types
          req.sessionModel.unset(`saved-cellTypes${cellId}`)
          req.sessionModel.set(`saved-cellTypes${cellId}-removed`, true)
          return
        }

        // Convert the temp data to saved data
        req.sessionModel.unset(`saved-cellTypes${cellId}-removed`)
        req.sessionModel.set(`saved-cellTypes${cellId}`, data)
      })

    req.sessionModel.unset('temp-capacitiesValues')

    next()
  }
}
