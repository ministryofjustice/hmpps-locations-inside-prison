import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import modifyFieldName from '../../helpers/field/modifyFieldName'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import getCellPath from './getCellPath'

export default class Capacities extends BaseController {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.createDynamicFields)
    this.use(this.unsetCellTypeTypes)
    this.use(this.setEditingCapacities)
    this.use(this.fixHistory)
  }

  override validateFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { backLink, cellTypeAction } = req.body
    if (cellTypeAction) {
      const [action, cellId] = cellTypeAction.split('/')

      req.sessionModel.set('temp-capacitiesValues', req.body)

      let prefix = 'create-cells'
      if (req.form.options.name === 'create-location') {
        prefix = 'create-new'
      } else if (req.form.options.name === 'edit-cells') {
        prefix = 'edit-cells'
      }

      res.redirect(
        `/${prefix}/${res.locals.locationId}/create-cells/${action}-cell-type/${cellId}${req.isEditing ? '/edit' : ''}`,
      )

      return
    }

    if (backLink) {
      req.sessionModel.set('temp-capacitiesValues', req.body)

      res.redirect(backLink)
      return
    }

    super.validateFields(req, res, async errors => {
      const { sessionModel } = req
      const { values } = req.form

      const cellsToCreate = Number(req.sessionModel.get<number>('create-cells_cellsToCreate')) || 0
      const specialistCellTypesObject = await req.services.locationsService.getSpecialistCellTypes(
        req.session.systemToken,
      )

      const validationErrors: FormWizard.Errors = {}

      // CARE_AND_SEPARATION and HEALTHCARE_INPATIENTS landings allow 0 cna/working cap, so skip this loop for those
      if (sessionModel.get<string>('create-cells_accommodationType') === 'NORMAL_ACCOMMODATION') {
        for (let i = 0; i < cellsToCreate; i += 1) {
          let cellTypes = sessionModel.get<string[]>(`temp-cellTypes${i}`)
          if (!cellTypes && !sessionModel.get<boolean>(`temp-cellTypes${i}-removed`)) {
            cellTypes = sessionModel.get<string[]>(`saved-cellTypes${i}`)
          }
          if (!cellTypes) {
            cellTypes = []
          }

          const workingCapacityKey = `create-cells_workingCapacity${i}`
          const baselineCnaKey = `create-cells_baselineCna${i}`
          const isSpecialistCellType = cellTypes.some(
            type => specialistCellTypesObject.find(sct => sct.key === type)?.attributes?.affectsCapacity,
          )

          if (!errors[workingCapacityKey] && values[workingCapacityKey] === '0' && !isSpecialistCellType) {
            validationErrors[workingCapacityKey] = this.formError(workingCapacityKey, 'nonZeroForNormalCell')
          }

          if (!errors[baselineCnaKey] && values[baselineCnaKey] === '0' && !isSpecialistCellType) {
            validationErrors[baselineCnaKey] = this.formError(baselineCnaKey, 'nonZeroForNormalCell')
          }
        }
      }

      next({ ...errors, ...validationErrors })
    })
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

  override async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locals } = res

    locals.specialistCellTypesObject = await req.services.locationsService.getSpecialistCellTypes(
      req.session.systemToken,
    )

    next()
  }

  createDynamicFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { options } = req.form
    const cellsToCreate = Number(req.sessionModel.get<number>('create-cells_cellsToCreate')) || 0

    options.fields = Object.fromEntries(
      Array(cellsToCreate)
        .fill(1)
        .flatMap((_, i) =>
          Object.entries(options.fields).map(([id, field]) => {
            const modifiedField = modifyFieldName(field, o => `${o}${i}`)

            modifiedField.errorSummaryPrefix = `Cell ${getCellPath(req, res, i)}: `
            if (id === 'create-cells_workingCapacity' || id === 'create-cells_baselineCna') {
              modifiedField.validate = [
                ...modifiedField.validate,
                lessThanOrEqualTo({ field: `create-cells_maximumCapacity${i}` }),
              ]
            }

            return [`${id}${i}`, modifiedField]
          }),
        ),
    )

    next()
  }

  unsetCellTypeTypes(req: FormWizard.Request, res: Response, next: NextFunction) {
    const modelData = req.sessionModel.toJSON()
    Object.keys(modelData)
      .filter(key => key.startsWith('create-cells_set-cell-type_accommodationType'))
      .forEach(key => req.sessionModel.unset(key))

    next()
  }

  setEditingCapacities(req: FormWizard.Request, res: Response, next: NextFunction) {
    req.sessionModel.set('editingCapacities', req.isEditing)

    next()
  }

  fixHistory(req: FormWizard.Request, res: Response, next: NextFunction) {
    const history = req.journeyModel
      .get<FormWizard.HistoryStep[]>('history')
      .filter(s => !s.path.includes('set-cell-type'))

    const capacitiesStep = history.find(s => s.path.endsWith('/capacities'))
    if (capacitiesStep) {
      const stepAfterCapacities = history.find(s => s.path.endsWith('/used-for')) ? 'used-for' : 'bulk-sanitation'
      capacitiesStep.next = capacitiesStep.next.replace('set-cell-type/:cellId/type', stepAfterCapacities)
    }

    req.journeyModel.set('history', history)

    next()
  }

  override locals(req: FormWizard.Request, res: Response) {
    const locals = super.locals(req, res)
    const { pathHierarchy } = res.locals.decoratedResidentialSummary.location
    const newLocationCode = req.sessionModel.get<string>(`locationCode`)

    locals.locationPathPrefix = [pathHierarchy, newLocationCode].filter(s => s).join('-')
    locals.specialistCellTypesObject = res.locals.specialistCellTypesObject

    return locals
  }

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    super.saveValues(req, res, () => {})

    const modelData = req.sessionModel.toJSON()
    Object.entries(modelData)
      .filter(([key]) => key.startsWith('temp-cellTypes'))
      .forEach(([key, data]) => {
        if (key.endsWith('-removed')) {
          // Remove the saved types
          req.sessionModel.unset(key.replace('temp', 'saved').replace('-removed', ''))
          return
        }

        // Convert the temp data to saved data
        req.sessionModel.unset(key)
        req.sessionModel.set(key.replace('temp', 'saved'), data)
      })

    req.sessionModel.unset('temp-capacitiesValues')

    next()
  }
}
