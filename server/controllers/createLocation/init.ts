import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { singularizeString } from '../../utils/utils'
import { LocationType } from '../../data/types/locationsApi'
import paths from '../../utils/paths'

export default class CreateLocationInit extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location, subLocationName } = res.locals.decoratedResidentialSummary

    if (location?.pendingApprovalRequestId) {
      res.redirect(paths.location.view(location))
      return
    }

    const locationType = singularizeString(subLocationName).toUpperCase() as LocationType
    req.sessionModel.set('locationType', locationType)
    req.sessionModel.set('locationId', location?.id)

    super.successHandler(req, res, next)
  }
}
