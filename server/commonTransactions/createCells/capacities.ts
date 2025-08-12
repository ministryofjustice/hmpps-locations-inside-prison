import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import modifyFieldName from '../../helpers/field/modifyFieldName'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import greaterThan from '../../validators/greaterThan'
import getCellPath from './getCellPath'

export default class Capacities extends BaseController {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.createDynamicFields)
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
            if (id === 'create-cells_workingCapacity') {
              modifiedField.validate = [
                ...modifiedField.validate,
                lessThanOrEqualTo({ field: `create-cells_maximumCapacity${i}` }),
              ]
            } else if (id === 'create-cells_baselineCna') {
              modifiedField.validate = [
                ...modifiedField.validate,
                lessThanOrEqualTo({ field: `create-cells_maximumCapacity${i}` }),
              ]

              if (req.sessionModel.get<string>(`create-cells_accommodationType`) === 'NORMAL_ACCOMMODATION') {
                modifiedField.validate.push(greaterThan(0))
              }
            }

            return [`${id}${i}`, modifiedField]
          }),
        ),
    )

    next()
  }

  override locals(req: FormWizard.Request, res: Response) {
    const locals = super.locals(req, res)

    const { pathHierarchy } = res.locals.decoratedResidentialSummary.location
    const newLocationCode = req.sessionModel.get<string>(`locationCode`)
    locals.locationPathPrefix = [pathHierarchy, newLocationCode].filter(s => s).join('-')

    return locals
  }
}
