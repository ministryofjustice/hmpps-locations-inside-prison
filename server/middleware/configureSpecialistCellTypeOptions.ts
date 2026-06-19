import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'

const FIELD_REGEX = /.*((?:normal|specialist))CellTypes.*$/

const getCellTypesField = (fields: FormWizard.Fields) =>
  Object.keys(fields)
    .find(k => FIELD_REGEX.test(k))
    .match(FIELD_REGEX)

const defaultAffectsCapacityFunction = (req: FormWizard.Request, _res: Response) => {
  const [, innerFieldName] = getCellTypesField(req.form.options.fields)
  return innerFieldName !== 'normal'
}

export default function configureSpecialistCellTypeOptions(affectsCapacityFunction = defaultAffectsCapacityFunction) {
  return async (req: FormWizard.Request, res: Response, next: NextFunction) => {
    const [fullFieldName] = getCellTypesField(req.form.options.fields)

    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

    const filteredSpecialistCellTypes = (affectsCapacityFilter: boolean) => {
      if (affectsCapacityFilter) {
        return specialistCellTypes.filter(cell => cell.attributes.affectsCapacity)
      }
      return specialistCellTypes.filter(cell => !cell.attributes.affectsCapacity)
    }
    const affectsCapacityFilter = affectsCapacityFunction(req, res)

    const cellTypesField = req.form.options.fields[fullFieldName]

    cellTypesField.items = Object.values(filteredSpecialistCellTypes(affectsCapacityFilter)).map(
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
}
