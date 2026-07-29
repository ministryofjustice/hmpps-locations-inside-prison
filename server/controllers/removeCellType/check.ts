import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../base/formStep'
import paths from '../../utils/paths'

export default class CheckRemoveCellType extends FormStep {
  override locals(req: FormWizard.Request, res: Response) {
    const { decoratedLocation } = res.locals
    const { specialistCellTypes } = decoratedLocation

    const multipleTypes = specialistCellTypes.length > 1

    if (multipleTypes) {
      res.locals.options.fields.areYouSure.errorMessages.required = 'Select yes if you want to remove the cell types'
    }

    const title = multipleTypes
      ? 'Are you sure you want to remove all of the cell types?'
      : 'Are you sure you want to remove the cell type?'

    const cellTypesLabel = multipleTypes ? 'Cell types:' : 'Cell type:'

    const cellTypesText = specialistCellTypes.join(', ')

    return {
      ...super.locals(req, res),
      cellTypesLabel,
      cellTypesText,
      title,
    }
  }

  override validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { areYouSure } = req.form.values

    if (areYouSure !== 'yes') {
      return res.redirect(paths.location.view(decoratedLocation))
    }

    return next()
  }
}
