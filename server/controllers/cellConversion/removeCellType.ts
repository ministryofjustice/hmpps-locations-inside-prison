import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import paths from '../../utils/paths'

export default class RemoveCellType extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { sessionModel } = req

    sessionModel.unset(`temp-cellTypes`)
    sessionModel.set(`temp-cellTypes-removed`, true)

    res.redirect(`${paths.location.cellConversion(res.locals.decoratedLocation)}/capacity`)
  }
}
