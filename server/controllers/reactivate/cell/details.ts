import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { Location } from '../../../data/types/locationsApi'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'
import { TypedLocals } from '../../../@types/express'

export default class ReactivateCellDetails extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(getReferrerRootUrl)
  }

  getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { decoratedLocation } = res.locals
    return {
      maxCapacity: decoratedLocation.capacity.maxCapacity,
      workingCapacity: decoratedLocation.oldWorkingCapacity,
    }
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    const { values } = req.form
    const { decoratedLocation } = res.locals
    const { accommodationTypes, specialistCellTypes }: Location = decoratedLocation.raw

    const validationErrors: FormWizard.Errors = {}

    if (!req.canAccess('change_max_capacity')) {
      values.maxCapacity = decoratedLocation.capacity.maxCapacity.toString()
    }

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

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation, referrerRootUrl } = res.locals
    const { id: locationId } = decoratedLocation

    const backLink = backUrl(req, {
      fallbackUrl: referrerRootUrl,
      nextStepUrl: `/reactivate/cell/${locationId}/confirm`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: referrerRootUrl,
    }
  }
}
