import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import { TypedLocals } from '../../@types/express'
import BaseController from './baseController'
import configureSpecialistCellTypeOptions from '../../middleware/configureSpecialistCellTypeOptions'

const FIELD_REGEX = /(.*)(?:normal|specialist)CellTypes(.*)$/

export default class SetCellType extends BaseController {
  override middlewareSetup(): void {
    super.middlewareSetup()
    this.use(configureSpecialistCellTypeOptions())
  }

  buttonText() {
    return 'Save cell type'
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const [, prefix, suffix] = Object.keys(req.form.options.fields)
      .find(k => FIELD_REGEX.test(k))
      .match(FIELD_REGEX)
    const locals = super.locals(req, res)
    const fields = locals.fields as FormWizard.Fields
    const key = `${prefix}normalCellTypes${suffix || ''}`

    const normalCellTypes = fields[key]
    // populate or clear normalCellTypes values
    if (normalCellTypes && req.form.values) {
      const selectedValues = normalCellTypes.value || []

      normalCellTypes.items = normalCellTypes.items.map((item: FormWizard.Item) => ({
        ...item,
        checked: selectedValues.includes(item.value),
      }))
    }
    return {
      ...locals,
      buttonText: this.buttonText(),
    }
  }
}
