import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { ServiceCode } from '../../../data/types/locationsApi/serviceCode'

export default class NonHousingCheckboxChangeConfirm extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId } = res.locals

    const backLink = backUrl(req, {
      fallbackUrl: `/admin/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals
    const { analyticsService, prisonService } = req.services
    const { disableNonHousingCheckboxes } = req.form.values

    if (disableNonHousingCheckboxes) {
      const serviceCode: ServiceCode = 'DISPLAY_HOUSING_CHECKBOX'
      try {
        await prisonService.activatePrisonService(req.session.systemToken, prisonId, serviceCode)

        analyticsService.sendEvent(req, 'disable_non_housing_checkboxes', {
          prison_id: prisonId,
          disableCheckboxes: true,
        })
        return next()
      } catch (error) {
        return next(error)
      }
    }
    return next()
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Non-housing checkboxes',
      content: `You have turned off the NOMIS checkboxes in non-housing location screen.`,
    })

    res.redirect(`/admin/${prisonId}`)
  }
}
