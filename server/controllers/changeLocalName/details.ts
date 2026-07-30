import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { sanitizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'
import populateTitleCaptionFromLocationOrPrison from '../../middleware/populateTitleCaptionFromLocationOrPrison'

export default class Details extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateTitleCaptionFromLocationOrPrison)
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    return {
      localName: res.locals.decoratedLocation.localName,
    }
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    return {
      ...locals,
      insetText:
        'This will change how the name displays on location lists but won’t change the location code (for example A-1-001).',
      buttonText: 'Save name',
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { locationsService } = req.services
      const { values } = req.form
      const { systemToken } = req.session
      const { decoratedLocation } = res.locals
      const { prisonId, parentId } = decoratedLocation

      const sanitizedLocalName = sanitizeString(String(values.localName))

      const validationErrors: FormWizard.Errors = {}

      if (!sanitizedLocalName) {
        return callback({ ...errors, ...validationErrors })
      }

      if (sanitizeString(String(values.localName)) === sanitizeString(decoratedLocation.localName)) {
        return res.redirect(paths.location.view(decoratedLocation))
      }

      try {
        const localNameExists = await locationsService.getLocationByLocalName(
          systemToken,
          String(prisonId),
          sanitizedLocalName,
          parentId,
        )
        if (localNameExists) {
          validationErrors.localName = this.formError('localName', 'taken')
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

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { systemToken } = req.session
      const { user, decoratedLocation } = res.locals
      const { locationsService } = req.services
      const { localName } = req.form.values

      const sanitizedLocalName = sanitizeString(String(localName))
      await locationsService.updateLocalName(systemToken, decoratedLocation.id, sanitizedLocalName, user.username)

      req.services.analyticsService.sendEvent(req, 'change_local_name', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Local name changed',
      content: `You have changed the local name.`,
    })

    res.redirect(paths.location.view(res.locals.decoratedLocation))
  }
}
