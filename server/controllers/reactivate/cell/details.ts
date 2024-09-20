import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { Location } from '../../../data/types/locationsApi'

export default class ReactivateCellDetails extends FormInitialStep {
  getInitialValues(req: FormWizard.Request, res: Response) {
    return {
      maxCapacity: res.locals.location.capacity.maxCapacity,
      workingCapacity: res.locals.location.oldWorkingCapacity,
    }
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { location } = res.locals
      const { accommodationTypes, specialistCellTypes }: Location = location.raw
      const occupants = res.locals.prisonerLocation?.prisoners || []

      const validationErrors: any = {}

      if (!errors.workingCapacity) {
        if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        } else if (Number(values?.workingCapacity) < occupants.length) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'isNoLessThanOccupancy')
        }
      }

      if (!errors.maxCapacity) {
        if (Number(values?.maxCapacity) < occupants.length) {
          validationErrors.maxCapacity = this.formError('maxCapacity', 'isNoLessThanOccupancy')
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { id: locationId, prisonId } = res.locals.location

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/reactivate/cell/${locationId}/confirm`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
