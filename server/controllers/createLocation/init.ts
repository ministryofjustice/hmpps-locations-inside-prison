import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import { singularizeString } from '../../utils/utils'
import { LocationType } from '../../data/types/locationsApi'

export default class CreateLocationInit extends FormInitialStep {
  render(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedResidentialSummary } = res.locals
    const locationType = singularizeString(decoratedResidentialSummary.subLocationName).toUpperCase() as LocationType
    req.sessionModel.set('locationType', locationType)
    req.sessionModel.set('locationId', decoratedResidentialSummary.location?.id)

    this.successHandler(req, res, next)
  }
}
