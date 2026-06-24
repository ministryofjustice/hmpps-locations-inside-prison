import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import capFirst from '../../formatters/capFirst'
import getCellPath from './getCellPath'
import populateExistingCells from './populateExistingCells'

export default class CellDoorNumbers extends BaseController {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setupDynamicFields)
    this.use(populateExistingCells)
  }

  setupDynamicFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { options } = req.form
    const locationName = `${getCellPath(req, res)}-`
    const cellsToCreate = req.sessionModel.get<number>('create-cells_cellsToCreate')
    const errors: { [key: string]: FormWizard.Controller.Error } = req.sessionModel.get('errors') || {}
    const errorValues: { [key: string]: FormWizard.Controller.Error } = req.sessionModel.get('errorValues') || {}

    for (let i = 0; i < cellsToCreate; i += 1) {
      const fieldKey = `create-cells_cellNumber${i}`
      options.fields[fieldKey] = {
        ...options.allFields['create-cells_cellNumber'],
        id: fieldKey,
        name: fieldKey,
        nameForErrors: `Cell number for cell ${i + 1}`,
        text: `Cell ${i + 1}`,
        label: {
          // clone the error messages, so that modifying the object doesn't affect the other fields
          ...(options.allFields['create-cells_cellNumber'].label || {}),
          text: `Cell number for cell ${i + 1}`,
          for: fieldKey,
          classes: 'govuk-visually-hidden',
        },
        errorMessages: {
          // clone the error messages, so that modifying the errorMessages object doesn't affect the other fields
          ...(options.allFields['create-cells_cellNumber'].errorMessages || {}),
        },
      }

      const formLocationCode = req.form.options.fields[fieldKey]
      formLocationCode.formGroup = {
        beforeInput: {
          html: `<span class="govuk-label govuk-input-prefix--plain">${locationName}</span>`,
        },
        classes: 'govuk-!-margin-bottom-0',
      }

      if (errors[fieldKey]) {
        const otherValueSet = Object.entries(errorValues)
          .filter(([key]) => key.startsWith('create-cells_cellNumber') && key !== fieldKey)
          .find(([_key, value]) => value === errorValues[fieldKey])
        if (otherValueSet) {
          const otherCellIndex = Number(otherValueSet[0].replace('create-cells_cellNumber', ''))

          options.fields[`create-cells_cellNumber${i}`].errorMessages.notUnique = `${capFirst(
            [i, otherCellIndex]
              .toSorted()
              .map(path => `cell ${path + 1}`)
              .join(' and '),
          )} have the same cell number`
        }
      }
    }

    next()
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const cellsToCreate = req.sessionModel.get<number>('create-cells_cellsToCreate')
      const { values } = req.form
      const { cells } = res.locals
      const validationErrors: FormWizard.Errors = {}

      const existingCodes = Object.fromEntries(cells.map(l => [Number(l.code), true]))
      const newCodes: { [key: number]: number } = {}

      for (let i = 0; i < cellsToCreate; i += 1) {
        const fieldKey = `create-cells_cellNumber${i}`
        const code = Number(values[fieldKey])

        if (!newCodes[code]) {
          newCodes[code] = 0
        }
        newCodes[code] += 1
      }

      for (let i = 0; i < cellsToCreate; i += 1) {
        const fieldKey = `create-cells_cellNumber${i}`
        const code = Number(values[fieldKey])

        if (!errors[fieldKey]) {
          if (existingCodes[code]) {
            validationErrors[fieldKey] = this.formError(fieldKey, 'taken')
          } else if (newCodes[code] > 1) {
            validationErrors[fieldKey] = this.formError(fieldKey, 'notUnique')
          }
        }
      }

      return callback({ ...errors, ...validationErrors })
    })
  }
}
