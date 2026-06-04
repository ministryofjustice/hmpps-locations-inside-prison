import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import addConstantToLocals from '../../middleware/addConstantToLocals'
import populateModifiedLocationMap from './middleware/populateModifiedLocationMap'

const CELL_TYPE_REGEX = /^temp-cellTypes(?:-removed)?$/

export default class CellConversionCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(this.fixHistory)
    this.use(this.unsetCellTypeTypes)
    this.use(populateModifiedLocationMap)
  }

  unsetCellTypeTypes(req: FormWizard.Request, res: Response, next: NextFunction) {
    const modelData = req.sessionModel.toJSON()
    Object.keys(modelData)
      .filter(key => key.startsWith('set-cell-type_accommodationType'))
      .forEach(key => req.sessionModel.unset(key))

    next()
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

  override getValues(
    req: FormWizard.Request,
    res: Response,
    callback: (err: Error, values?: FormWizard.Values) => void,
  ) {
    return super.getValues(req, res, (err: Error, values?: FormWizard.Values) => {
      const modifiedValues = {
        ...(values || {}),
        ...Object.fromEntries(
          Object.entries(req.sessionModel.get('temp-capacitiesValues') || {}).filter(
            ([key]) => key in req.form.options.fields,
          ),
        ),
        ...(req.sessionModel.get<object>('errorValues') || {}),
      }

      callback(err, modifiedValues)
    })
  }

  override validateFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { cellTypeAction } = req.body
    if (cellTypeAction) {
      req.sessionModel.set('temp-capacitiesValues', req.body)

      const suffix = `${cellTypeAction === 'set' ? '/init' : ''}${req.isEditing ? '/edit' : ''}`

      res.redirect(`/location/${res.locals.decoratedLocation.id}/cell-conversion/${cellTypeAction}-cell-type${suffix}`)

      return
    }

    super.validateFields(req, res, errors => {
      const { modifiedLocationMap, decoratedLocation, constants } = res.locals
      const { specialistCellTypes } = constants

      const validationErrors: FormWizard.Errors = {}

      // CARE_AND_SEPARATION and HEALTHCARE_INPATIENTS landings allow 0 cna/working cap, so skip this loop for those
      if (req.sessionModel.get<string>('accommodationType') === 'NORMAL_ACCOMMODATION') {
        const cell = modifiedLocationMap[decoratedLocation.id]

        const workingCapacityKey = `CERT_workingCapacity`
        const baselineCnaKey = `CERT_baselineCna`
        const isSpecialistCellType = cell.specialistCellTypes.some(
          type => specialistCellTypes.find(sct => sct.key === type)?.attributes?.affectsCapacity,
        )

        if (!errors[workingCapacityKey] && cell.capacity.workingCapacity === 0 && !isSpecialistCellType) {
          validationErrors[workingCapacityKey] = this.formError(workingCapacityKey, 'nonZeroForNormalCell')
        }

        if (!errors[baselineCnaKey] && cell.capacity.certifiedNormalAccommodation === 0 && !isSpecialistCellType) {
          validationErrors[baselineCnaKey] = this.formError(baselineCnaKey, 'nonZeroForNormalCell')
        }
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
        req.sessionModel.unset(key)

        if (key.endsWith('-removed')) {
          // Remove the saved types
          req.sessionModel.unset(`saved-cellTypes`)
          req.sessionModel.set(`saved-cellTypes-removed`, true)
          return
        }

        // Convert the temp data to saved data
        req.sessionModel.unset(`saved-cellTypes-removed`)
        req.sessionModel.set(`saved-cellTypes`, data)
      })

    req.sessionModel.unset('temp-capacitiesValues')

    next()
  }
}
