import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { singularizeString } from '../../utils/utils'
import { LocationType } from '../../data/types/locationsApi'

export default class CreateLocationInit extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedResidentialSummary } = res.locals
    const locationType = singularizeString(decoratedResidentialSummary.subLocationName).toUpperCase() as LocationType
    req.sessionModel.set('locationType', locationType)
    req.sessionModel.set('locationId', decoratedResidentialSummary.location?.id)

    super.successHandler(req, res, next)
  }
}
