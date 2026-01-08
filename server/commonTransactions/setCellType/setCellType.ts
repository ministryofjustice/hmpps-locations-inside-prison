import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import BaseController from './baseController'

const FIELD_REGEX = /(.*)(?:normal|specialist)CellTypes(\d*)$/

export default class SetCellType extends BaseController {
  override async configure(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const [, prefix] = Object.keys(req.form.options.fields)
      .find(k => FIELD_REGEX.test(k))
      .match(FIELD_REGEX)

    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

    const filteredSpecialistCellTypes = (affectsCapacity?: string) => {
      if (affectsCapacity) {
        return specialistCellTypes.filter(cell => cell.attributes.affectsCapacity)
      }
      return specialistCellTypes.filter(cell => !cell.attributes.affectsCapacity)
    }

    const filterArg = req.form.options.fields[`${prefix}normalCellTypes`] ? undefined : 'affectsCapacity'

    const cellTypesField =
      req.form.options.fields[`${prefix}normalCellTypes`] || req.form.options.fields[`${prefix}specialistCellTypes`]

    cellTypesField.items = Object.values(filteredSpecialistCellTypes(filterArg)).map(
      ({ key, description, additionalInformation }) => ({
        text: description,
        value: key,
        hint: {
          text: additionalInformation,
        },
      }),
    )
    next()
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
    return locals
  }
}
