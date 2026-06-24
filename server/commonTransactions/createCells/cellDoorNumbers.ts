import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import capFirst from '../../formatters/capFirst'
import getCellPath from './getCellPath'

export default class CellDoorNumbers extends BaseController {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setupDynamicFields)
  }

  setupDynamicFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { options } = req.form

    const cellsToCreate = req.sessionModel.get<number>('create-cells_cellsToCreate')
    const errors: { [key: string]: FormWizard.Controller.Error } = req.sessionModel.get('errors') || {}
    const errorValues: { [key: string]: FormWizard.Controller.Error } = req.sessionModel.get('errorValues') || {}

    for (let i = 0; i < cellsToCreate; i += 1) {
      const fieldKey = `create-cells_doorNumber${i}`
      const cellPath = getCellPath(req, res, i)

      options.fields[fieldKey] = {
        ...options.allFields['create-cells_doorNumber'],
        id: fieldKey,
        name: fieldKey,
        text: cellPath,
        nameForErrors: `Cell door number for ${cellPath}`,
        errorMessages: {
          // clone the error messages, so that modifying the object doesn't effect the other fields
          ...(options.allFields['create-cells_doorNumber'].errorMessages || {}),
        },
      }

      if (errors[fieldKey]) {
        const otherValueSet = Object.entries(errorValues)
          .filter(([key]) => key.startsWith('create-cells_doorNumber') && key !== fieldKey)
          .find(([_key, value]) => value === errorValues[fieldKey])
        if (otherValueSet) {
          const otherCellIndex = Number(otherValueSet[0].replace('create-cells_doorNumber', ''))
          const otherCellPath = getCellPath(req, res, otherCellIndex)

          options.fields[`create-cells_doorNumber${i}`].errorMessages.notUnique = `${capFirst(
            [cellPath, otherCellPath]
              .toSorted()
              .map(path => `cell ${path}`)
              .join(' and '),
          )} have the same cell door number`
        }
      }
    }

    next()
  }

  override locals(req: FormWizard.Request, res: Response) {
    const locals = super.locals(req, res)

    locals.insetText = 'This is the actual number written on the cell door. It may be different to the cell number.'

    return locals
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const cellsToCreate = req.sessionModel.get<number>('create-cells_cellsToCreate')
      const { values } = req.form
      const { decoratedResidentialSummary } = res.locals
      const validationErrors: FormWizard.Errors = {}

      const existingDoorNumbers = Object.fromEntries(
        decoratedResidentialSummary.subLocations.map(l => [l.cellMark, true]),
      )
      const newDoorNumbers: { [key: string]: number } = {}

      for (let i = 0; i < cellsToCreate; i += 1) {
        const fieldKey = `create-cells_doorNumber${i}`
        const doorNumber = values[fieldKey] as string

        if (!newDoorNumbers[doorNumber]) {
          newDoorNumbers[doorNumber] = 0
        }
        newDoorNumbers[doorNumber] += 1
      }

      for (let i = 0; i < cellsToCreate; i += 1) {
        const fieldKey = `create-cells_doorNumber${i}`
        const doorNumber = values[fieldKey] as string

        if (!errors[fieldKey]) {
          if (existingDoorNumbers[doorNumber]) {
            validationErrors[fieldKey] = this.formError(fieldKey, 'taken')
          } else if (newDoorNumbers[doorNumber] > 1) {
            validationErrors[fieldKey] = this.formError(fieldKey, 'notUnique')
          }
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }
}
