import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { Location } from '../../data/locationsApiClient'

export default class ChangeCellCapacity extends FormInitialStep {
  getInitialValues(req: FormWizard.Request, res: Response) {
    return res.locals.location.capacity
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { location } = res.locals
      const { accommodationTypes, specialistCellTypes }: Location = location

      const validationErrors: any = {}

      if (!errors.workingCapacity) {
        if (Number(values?.workingCapacity) > Number(values?.maxCapacity)) {
          validationErrors.workingCapacity = new FormWizard.Controller.Error('workingCapacity', {
            args: {},
            type: 'doesNotExceedMaxCap',
            url: '/',
          })
        } else if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = new FormWizard.Controller.Error('workingCapacity', {
            args: {},
            type: 'nonZeroForNormalCell',
            url: '/',
          })
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { maxCapacity: newMaxCap, workingCapacity: newWorkingCap } = req.form.values
    const { maxCapacity, workingCapacity } = location.capacity

    if (Number(newMaxCap) === maxCapacity && Number(newWorkingCap) === workingCapacity) {
      return res.redirect(`/view-and-update-locations/${location.prisonId}/${location.id}`)
    }

    return next()
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { id: locationId, prisonId } = res.locals.location

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/location/${locationId}/change-cell-capacity/confirm`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/location/${locationId}/change-cell-capacity/cancel`,
    }
  }
}
