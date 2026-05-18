import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'

export default class TemporaryInactiveInit extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (!req.canAccess('certificate_change_request_create')) {
      const { prisonId, id } = res.locals.decoratedLocation
      res.redirect(`/view-and-update-locations/${prisonId}/${id}`)
      return null
    }

    req.sessionModel.set('reduceWorkingCapacity', 'YES')

    return super.successHandler(req, res, next)
  }
}
