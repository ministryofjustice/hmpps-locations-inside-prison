import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { Location } from '../../data/locationsApiClient'

export default class ChangeCellCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getPrisonersInLocation)
  }

  async getPrisonersInLocation(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location, user } = res.locals
    const token = await req.services.authService.getSystemClientToken(user.username)
    const [prisonerLocation] = await req.services.locationsService.getPrisonersInLocation(token, location.id)

    res.locals.prisonerLocation = prisonerLocation

    next()
  }

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
          validationErrors.workingCapacity = this.formError('workingCapacity', 'doesNotExceedMaxCap')
        } else if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        }
      }

      if (!errors.maxCapacity) {
        const occupants = res.locals.prisonerLocation?.prisoners || []

        if (Number(values?.maxCapacity) < occupants.length) {
          validationErrors.maxCapacity = this.formError('maxCapacity', 'isNoLessThanOccupancy')
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
      return res.redirect(`/location/${location.id}/change-cell-capacity/cancel`)
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
