import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'
import getLocationResidentialSummary from '../parent/middleware/getLocationResidentialSummary'
import populateLocationTree, { DecoratedLocationTree } from '../parent/middleware/populateLocationTree'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import capFirst from '../../../formatters/capFirst'
import modifyFieldName from '../../../helpers/field/modifyFieldName'
import lessThanOrEqualTo from '../../../validators/lessThanOrEqualTo'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'
import { getValues } from './util/getValues'
import populateModifiedLocationMap from './middleware/populateModifiedLocationMap'

const CELL_TYPE_REGEX = /^temp-cellTypes(.+?)(?:-removed)?$/

const findLocationInLocationTrees = (locationTrees: DecoratedLocationTree[], id: string): DecoratedLocation => {
  for (const tree of locationTrees) {
    if (tree.decoratedLocation.id === id) {
      return tree.decoratedLocation
    }

    const location = findLocationInLocationTrees(tree.decoratedSubLocations, id)
    if (location) {
      return location
    }
  }

  return null
}

export default class EditCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(true))
    this.use(addConstantToLocals('specialistCellTypes'))
    this.use(populateModifiedLocationMap)
    this.use(this.fixHistory)
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
      if (!checkCapacitiesStep.next.includes('/edit-capacity/')) {
        checkCapacitiesStep.next = `/reactivate/location/${res.locals.decoratedLocation.id}/edit-capacity/${req.params.parentLocationId}`
        req.journeyModel.set('history', history)
      }

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

  getParent(req: FormWizard.Request, res: Response): DecoratedLocation {
    const { parentLocationId } = req.params

    return findLocationInLocationTrees(res.locals.decoratedLocationTree, parentLocationId)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedCells } = res.locals

    return {
      ...locals,
      title: `Edit capacity of cell${decoratedCells.length > 1 ? 's' : ''}`,
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
    const { decoratedCells } = res.locals

    options.fields = Object.fromEntries(
      decoratedCells.flatMap(cell => {
        const { id } = cell
        return Object.entries(options.fields).map(([fieldId, field]) => {
          const modifiedField = modifyFieldName(field, o => `${o}-${id}`)

          modifiedField.remove = undefined
          modifiedField.removed = false
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

    // Update the modified location map so that values from the form are accounted for
    populateModifiedLocationMap(req, res, null)

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
