import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { lowerFirst } from 'lodash'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import getLocationResidentialSummary from '../reactivate/parent/middleware/getLocationResidentialSummary'
import otherCertificateDifferences from './otherCertificateDifferences'

export default class DetailsController extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(this.populateItems)
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location, locationResidentialSummary } = res.locals
    const { certifiedChange } = req.form.options.fields
    const alsoChanges = otherCertificateDifferences(locationResidentialSummary.parentLocation).map(
      ({ label, current, certified }) =>
        `This will also change the ${lowerFirst(label)} from ${current} to ${certified}.`,
    )

    certifiedChange.items = [
      {
        text: 'Change the working capacity to match the certified working capacity',
        value: 'NO',
        ...(alsoChanges.length && { hint: { text: alsoChanges.join(' ') } }),
      },
      {
        text: `Request to change the certified working capacity to ${location.capacity.workingCapacity}`,
        value: 'YES',
      },
    ]

    next()
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    locals.otherCertificateDifferences = otherCertificateDifferences(
      res.locals.locationResidentialSummary.parentLocation,
    )

    return locals
  }

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (req.form.values.certifiedChange === 'YES') {
      req.sessionModel.set('certifiedWorkingCapacity', res.locals.location.capacity.workingCapacity)
    }

    super.saveValues(req, res, next)
  }
}
