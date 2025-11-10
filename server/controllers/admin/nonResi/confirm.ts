import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import backUrl from '../../../utils/backUrl'
import FormInitialStep from '../../base/formInitialStep'
import { StatusType } from '../../../data/types/locationsApi'

export default class NonResiStatusChangeConfirm extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
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
      title: 'Update non-residential locations status',
      buttonText: `${prisonConfiguration.nonResiServiceActive === 'INACTIVE' ? 'Activate' : 'Inactivate'} non-residential locations`,
      cancelText: 'Cancel and return to prison configuration details',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals.prisonConfiguration
    const { analyticsService, locationsService } = req.services
    const { activation } = req.form.values
    const status = activation as StatusType

    try {
      await locationsService.updateNonResiStatus(req.session.systemToken, prisonId, status)

      analyticsService.sendEvent(req, 'non_resi_status', {
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
      title: 'Non-residential locations status',
      content: `You have changed the non-residential locations status.`,
    })

    res.redirect(`/admin/${prisonId}`)
  }
}
