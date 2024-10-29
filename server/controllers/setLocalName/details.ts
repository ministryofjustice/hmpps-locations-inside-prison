import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { sanitizeString } from '../../utils/utils'

export default class Details extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, any> {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  async validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, async errors => {
      const { locationsService } = req.services
      const { values } = req.form
      const sanitizedLocalName = sanitizeString(String(values.localName))
      const { user, location } = res.locals
      const token = await req.services.authService.getSystemClientToken(user.username)
      const { prisonId } = location
      const validationErrors: any = {}
      try {
        const localNameExists = await locationsService.getLocationByLocalName(
          token,
          String(prisonId),
          sanitizedLocalName,
        )
        if (localNameExists) {
          validationErrors.localName = this.formError('localName', 'localNameExists')
          return callback({ ...errors, ...validationErrors })
        }
      } catch (error) {
        return callback({ ...errors, ...validationErrors })
      }
      return callback({ ...errors, ...validationErrors })
    })
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user, location } = res.locals
      const { locationsService } = req.services
      const { localName } = req.form.values
      const token = await req.services.authService.getSystemClientToken(user.username)

      const sanitizedLocalName = sanitizeString(String(localName))
      await locationsService.updateLocalName(token, location.id, sanitizedLocalName, user.username)

      res.locals.location.localName = localName

      req.services.analyticsService.sendEvent(req, 'set_local_name', { prison_id: location.prisonId })

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
      title: 'Local name added',
      content: 'You have added a local name.',
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
