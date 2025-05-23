import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import populateLocation from '../../middleware/populateLocation'

export default class CheckRemoveCellType extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    // decorate the location now that the steps config has been processed
    this.use(populateLocation({ decorate: true }))
  }

  locals(req: FormWizard.Request, res: Response) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId, specialistCellTypes } = decoratedLocation

    const multipleTypes = specialistCellTypes.length > 1

    if (multipleTypes) {
      res.locals.options.fields.areYouSure.errorMessages.required =
        'Select yes if you want to remove the specific cell types'
    }

    const locals = super.locals(req, res)

    const pageTitleText = multipleTypes
      ? 'Are you sure you want to remove all of the specific cell types?'
      : 'Are you sure you want to remove the specific cell type?'

    const cellTypesLabel = multipleTypes ? 'Cell types:' : 'Cell type:'

    const cellTypesText = specialistCellTypes.join(', ')

    return {
      ...locals,
      backLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      cellTypesLabel,
      cellTypesText,
      pageTitleText,
    }
  }

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { areYouSure } = req.form.values

    if (areYouSure !== 'yes') {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }
}
