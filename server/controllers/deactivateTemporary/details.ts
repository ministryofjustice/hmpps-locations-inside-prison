import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import { Location } from '../../data/locationsApiClient'

export default class DeactivateTemporaryDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.populateDeactivationReasons)
    super.middlewareSetup()
  }

  async populateDeactivationReasons(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { locationsService } = req.services
    const { deactivationReason } = req.form.options.fields
    const token = await req.services.authService.getSystemClientToken(user.username)
    deactivationReason.items = Object.entries(await locationsService.getDeactivatedReasons(token)).map(
      ([key, value]) => ({
        text: value,
        value: key,
        conditional: key === 'OTHER' ? 'deactivationReasonOther' : undefined,
      }),
    )

    next()
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

      callback({ ...errors, ...validationErrors })
    })
  }

  validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { maxCapacity: newMaxCap, workingCapacity: newWorkingCap } = req.form.values
    const { maxCapacity, workingCapacity } = location.capacity

    if (Number(newMaxCap) === maxCapacity && Number(newWorkingCap) === workingCapacity) {
      return res.redirect(`/location/${location.id}/deactivate/temporary/cancel`)
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
