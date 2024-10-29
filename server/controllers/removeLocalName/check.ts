import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'

export default class RemoveLocalName extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response) {
    const { location } = res.locals
    const { id: locationId, prisonId, localName } = location

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

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user, location } = res.locals
      const { locationsService } = req.services
      const token = await req.services.authService.getSystemClientToken(user.username)
      const localName: any = null
      await locationsService.updateLocalName(token, location.id, localName, user.username)

      req.services.analyticsService.sendEvent(req, 'remove_local_name', { prison_id: location.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId } = res.locals.location
    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: 'Local name removed',
      content: `You have removed the local name for this location.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
