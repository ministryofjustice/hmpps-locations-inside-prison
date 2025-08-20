import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../../controllers/base/formInitialStep'
import getCellPath from '../createCells/getCellPath'

export default class SetCellType extends FormInitialStep {
  override async configure(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

    const filteredSpecialistCellTypes = (affectsCapacity?: string) => {
      if (affectsCapacity) {
        return specialistCellTypes.filter(cell => cell.attributes.affectsCapacity)
      }
      return specialistCellTypes.filter(cell => !cell.attributes.affectsCapacity)
    }

    const filterArg = req.form.options.fields['create-cells_set-cell-type_normalCellTypes']
      ? undefined
      : 'affectsCapacity'

    const cellTypesField =
      req.form.options.fields['create-cells_set-cell-type_normalCellTypes'] ||
      req.form.options.fields['create-cells_set-cell-type_specialistCellTypes']

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

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { cellId } = req.params
    const cellName = getCellPath(req, res, Number(cellId))
    locals.titleCaption = ` Cell ${cellName}`

    const fields = locals.fields as FormWizard.Fields
    const key = `create-cells_set-cell-type_normalCellTypes${cellId}`
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

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { sessionModel } = req
    const { cellId } = req.params
    const normalCellTypes = `create-cells_set-cell-type_normalCellTypes${cellId}`
    const specialCellTypes = `create-cells_set-cell-type_specialistCellTypes${cellId}`
    const accommodationType = `create-cells_set-cell-type_accommodationType${cellId}`
    if (sessionModel.get<string>(accommodationType) === 'NORMAL_ACCOMMODATION') {
      sessionModel.unset(specialCellTypes)
    } else if (sessionModel.get<string>(accommodationType) === 'SPECIAL_ACCOMMODATION') {
      sessionModel.unset(normalCellTypes)
    }
    super.saveValues(req, res, next)
  }
}
