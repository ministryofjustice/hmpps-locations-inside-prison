import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../../base/formStep'
import { Location } from '../../../data/types/locationsApi'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'
import { TypedLocals } from '../../../@types/express'
import populateTitleCaptionFromLocationOrPrison from '../../../middleware/populateTitleCaptionFromLocationOrPrison'

export default class ReactivateCellDetails extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getReferrerRootUrl)
    this.use(populateTitleCaptionFromLocationOrPrison)
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { decoratedLocation } = res.locals
    return {
      maxCapacity: decoratedLocation.capacity.maxCapacity,
      workingCapacity: decoratedLocation.oldWorkingCapacity,
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    const { values } = req.form
    const { decoratedLocation } = res.locals
    const { accommodationTypes, specialistCellTypes }: Location = decoratedLocation.raw

    const validationErrors: FormWizard.Errors = {}

    super.validateFields(req, res, errors => {
      if (!errors.workingCapacity) {
        if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { referrerRootUrl } = res.locals

    return {
      ...super.locals(req, res),
      backLink: referrerRootUrl,
      cancelLink: referrerRootUrl,
      insetText:
        'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
    }
  }
}
