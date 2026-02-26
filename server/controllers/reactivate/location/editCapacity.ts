import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'
import getLocationResidentialSummary from '../parent/middleware/getLocationResidentialSummary'
import populateLocationTree from '../parent/middleware/populateLocationTree'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import capFirst from '../../../formatters/capFirst'
import modifyFieldName from '../../../helpers/field/modifyFieldName'
import lessThanOrEqualTo from '../../../validators/lessThanOrEqualTo'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'
import getCells from './util/getCells'
import applyChangesToLocationTree from './middleware/applyChangesToLocationTree'
import { getValues } from './util/getValues'

const CELL_TYPE_REGEX = /^temp-cellTypes(.+?)(?:-removed)?$/

export default class EditCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(true))
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(applyChangesToLocationTree)
    this.use(this.fixHistory)
    this.use(this.populateCells)
    this.use(this.createDynamicFields)
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
    let history = req.journeyModel
      .get<FormWizard.HistoryStep[]>('history')
      .filter(s => !s.path.includes('set-cell-type') && !s.path.includes('/edit-capacity/'))

    const checkCapacitiesStep = history.find(s => s.path.endsWith('/check-capacity'))
    if (checkCapacitiesStep) {
      next()
      return
    }

    this.addJourneyHistoryStep(req, res, {
      path: `/reactivate/location/${res.locals.decoratedLocation.id}/check-capacity`,
      next: `/reactivate/location/${res.locals.decoratedLocation.id}/edit-capacity/${req.params.parentLocationId}`,
      wizard: req.form.options.name,
      revalidate: false,
      skip: false,
      editing: req.isEditing && !req.notRevalidated ? true : undefined,
      continueOnEdit: req.isEditing && !req.notRevalidated ? true : undefined,
    })

    history = req.journeyModel.get<FormWizard.HistoryStep[]>('history').filter(s => !s.path.includes('set-cell-type'))

    req.journeyModel.set('history', history)

    next()
  }

  populateCells(req: FormWizard.Request, res: Response, next: NextFunction) {
    res.locals.cells = getCells(res.locals.decoratedLocationTree).filter(
      c => c.parentId === req.params.parentLocationId || c.id === req.params.parentLocationId,
    )

    next()
  }

  getParent(req: FormWizard.Request, res: Response): DecoratedLocation {
    const { parentLocationId } = req.params
    const { decoratedLocation } = res.locals
    if (parentLocationId === decoratedLocation.id) {
      return decoratedLocation
    }

    return res.locals.decoratedLocationTree.find(tree => tree.decoratedLocation.id === parentLocationId)
      ?.decoratedLocation
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { cells } = res.locals

    return {
      ...locals,
      title: `Edit capacity of cell${cells.length > 1 ? 's' : ''}`,
      titleCaption: capFirst(this.getParent(req, res).displayName),
      minLayout: 'three-quarters',
      backLink: `/reactivate/location/${res.locals.decoratedLocation.id}/check-capacity`,
    }
  }

  override getValues(
    req: FormWizard.Request,
    res: Response,
    callback: (err: Error, values?: FormWizard.Values) => void,
  ) {
    return super.getValues(req, res, (err: Error, _values?: FormWizard.Values) => {
      callback(err, getValues(req, res))
    })
  }

  createDynamicFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { options } = req.form
    const { cells } = res.locals

    options.fields = Object.fromEntries(
      cells.flatMap(cell => {
        const { id } = cell
        return Object.entries(options.fields).map(([fieldId, field]) => {
          const modifiedField = modifyFieldName(field, o => `${o}-${id}`)

          modifiedField.errorSummaryPrefix = `${cell.pathHierarchy}: `
          if (fieldId === 'workingCapacity' || fieldId === 'baselineCna') {
            modifiedField.validate = [...modifiedField.validate, lessThanOrEqualTo({ field: `maximumCapacity-${id}` })]
          }

          return [`${fieldId}-${id}`, modifiedField]
        })
      }),
    )

    next()
  }

  override validateFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { cellTypeAction } = req.body
    if (cellTypeAction) {
      const [action, cellId] = cellTypeAction.split('/')

      req.sessionModel.set('temp-capacitiesValues', req.body)

      const suffix = `${action === 'set' ? '/init' : ''}${req.isEditing ? '/edit' : ''}`

      res.redirect(`/reactivate/location/${res.locals.decoratedLocation.id}/${cellId}/${action}-cell-type${suffix}`)

      return
    }

    super.validateFields(req, res, async errors => {
      const { values } = req.form
      const { cells, locationResidentialSummary } = res.locals
      const { accommodationTypes } = locationResidentialSummary.parentLocation

      const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

      const validationErrors: FormWizard.Errors = {}

      // CARE_AND_SEPARATION and HEALTHCARE_INPATIENTS landings allow 0 cna/working cap, so skip this loop for those
      if (
        !accommodationTypes.includes('HEALTHCARE_INPATIENTS') &&
        !accommodationTypes.includes('CARE_AND_SEPARATION')
      ) {
        cells.forEach(cell => {
          const { id } = cell

          const workingCapacityKey = `workingCapacity-${id}`
          const baselineCnaKey = `baselineCna-${id}`
          const isSpecialistCellType = cell.specialistCellTypes.some(
            type => specialistCellTypes.find(sct => sct.key === type)?.attributes?.affectsCapacity,
          )

          if (!errors[workingCapacityKey] && values[workingCapacityKey] === '0' && !isSpecialistCellType) {
            validationErrors[workingCapacityKey] = this.formError(workingCapacityKey, 'nonZeroForNormalCell')
          }

          if (!errors[baselineCnaKey] && values[baselineCnaKey] === '0' && !isSpecialistCellType) {
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
