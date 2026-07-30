import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default class RemoveLocalName extends FormStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    return {
      ...super.locals(req, res),
      buttonText: 'Remove name',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user, decoratedLocation } = res.locals
      const { locationsService } = req.services
      await locationsService.updateLocalName(req.session.systemToken, decoratedLocation.id, null, user.username)

      req.services.analyticsService.sendEvent(req, 'remove_local_name', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Local name removed',
      content: `You have removed the local name for this location.`,
    })

    res.redirect(paths.location.view(res.locals.decoratedLocation))
  }
}
