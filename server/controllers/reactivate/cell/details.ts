import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { Location } from '../../../data/types/locationsApi'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'

export default class ReactivateCellDetails extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(getReferrerRootUrl)
  }

  getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
    return {
      maxCapacity: res.locals.location.capacity.maxCapacity,
      workingCapacity: res.locals.location.oldWorkingCapacity,
    }
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { location } = res.locals
      const { accommodationTypes, specialistCellTypes }: Location = location.raw

      const validationErrors: FormWizard.Errors = {}

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

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
    const locals = super.locals(req, res)
    const { location, referrerRootUrl } = res.locals
    const { id: locationId } = location

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
