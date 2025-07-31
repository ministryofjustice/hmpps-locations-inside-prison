import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import capFirst from '../../formatters/capFirst'

const getCellPath = (req: FormWizard.Request, res: Response, index: number) => {
  const { pathHierarchy } = res.locals.decoratedResidentialSummary.location
  // TODO: remove the fallback (index + 1) when cellNumbers page is complete
  const cellNumber = (
    req.sessionModel.get<string>(`create-cells_cellNumber${index}`) || (index + 1).toString()
  ).padStart(3, '0')

  return `${pathHierarchy}-${cellNumber}`
}

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
    const { values } = req.form
    const cellsToCreate = req.sessionModel.get<number>('create-cells_cellsToCreate')

    const validationErrors: FormWizard.Errors = {}

    super.validateFields(req, res, errors => {
      for (let i = 0; i < cellsToCreate; i += 1) {
        const fieldKey = `create-cells_doorNumber${i}`
        const doorNumber = values[fieldKey]

        if (doorNumber !== '' && !errors[fieldKey]) {
          for (let oi = 0; oi < cellsToCreate; oi += 1) {
            if (i !== oi) {
              const otherDoorNumber = values[`create-cells_doorNumber${oi}`]

              if (doorNumber === otherDoorNumber) {
                validationErrors[fieldKey] = this.formError(fieldKey, 'notUnique')

                break
              }
            }
          }
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }
}
