import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'

export default class RemoveLocalName extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId, localName } = decoratedLocation

    const locals = super.locals(req, res)

    const pageTitleText = 'Are you sure you want to remove the local name?'

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      localName,
      pageTitleText,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
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
