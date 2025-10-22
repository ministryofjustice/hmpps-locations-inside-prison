import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class RemoveLocalName extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    const locals = super.locals(req, res)

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      title: 'Are you sure you want to remove the local name?',
      titleCaption: capFirst(decoratedLocation.displayName),
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
    const { id: locationId, prisonId } = res.locals.decoratedLocation
    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: 'Local name removed',
      content: `You have removed the local name for this location.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
