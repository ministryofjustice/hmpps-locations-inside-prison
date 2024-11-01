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

    const fields = { ...locals.fields }
    fields.localName.value = req.form.values.localName || res.locals.location.localName

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
      const { locationsService, authService } = req.services
      const { values } = req.form
      const { user, location } = res.locals
      const { prisonId, id: locationId, parentId } = location

      const sanitizedLocalName = sanitizeString(String(values.localName))
      const token = await authService.getSystemClientToken(user.username)

      const validationErrors: any = {}

      if (sanitizeString(String(values.localName)) === sanitizeString(res.locals.location.localName)) {
        return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
      }
      try {
        const localNameExists = await locationsService.getLocationByLocalName(
          token,
          String(prisonId),
          sanitizedLocalName,
          parentId,
        )
        if (localNameExists) {
          validationErrors.localName = this.formError('localName', 'localNameExists')
          return callback({ ...errors, ...validationErrors })
        }
      } catch (error) {
        if (error.data?.errorCode === 101) {
          return callback({ ...errors, ...validationErrors })
        }
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

      req.services.analyticsService.sendEvent(req, 'change_local_name', { prison_id: location.prisonId })

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
      title: 'Local name changed',
      content: `You have changed the local name.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
