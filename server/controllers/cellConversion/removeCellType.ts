import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class RemoveCellType extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { sessionModel } = req

    sessionModel.unset(`temp-cellTypes`)
    sessionModel.set(`temp-cellTypes-removed`, true)

    res.redirect(`/location/${res.locals.decoratedLocation.id}/cell-conversion/capacity`)
  }
}
