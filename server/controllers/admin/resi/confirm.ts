import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { StatusType } from '../../../data/types/locationsApi'
import { ServiceCode } from '../../../data/types/locationsApi/serviceCode'

export default class ResiStatusChangeConfirm extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonConfiguration } = res.locals
    const { prisonId } = prisonConfiguration

    const backLink = backUrl(req, {
      fallbackUrl: `/admin/${prisonId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: backLink,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const { analyticsService, locationsService, prisonService } = req.services
    const { activation } = req.form.values
    const status = activation as StatusType

    try {
      await locationsService.updateResiStatus(req.session.systemToken, prisonId, status)

      const serviceCode: ServiceCode = 'DISPLAY_HOUSING_CHECKBOX'
      if (status === 'ACTIVE') {
        await prisonService.activatePrisonService(req.session.systemToken, prisonId, serviceCode)
      } else {
        await prisonService.deactivatePrisonService(req.session.systemToken, prisonId, serviceCode)
      }

      // block or unblock the screen
      try {
        await prisonService.getScreenStatus(req.session.systemToken, prisonId)
        await prisonService.updateScreen(req.session.systemToken, prisonId, status === 'ACTIVE')
      } catch (error) {
        if (error.responseStatus === 404) {
          await prisonService.addCondition(req.session.systemToken, prisonId, status === 'ACTIVE')
        }
      }

      analyticsService.sendEvent(req, 'resi_status', {
        prison_id: prisonId,
        status,
      })
      return next()
    } catch (error) {
      return next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Residential location status',
      content: `You have changed the residential location status.`,
    })

    res.redirect(`/admin/${prisonId}`)
  }
}
