import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { sanitizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default class Details extends FormStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    return {
      ...super.locals(req, res),
      buttonText: 'Save name',
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { locationsService } = req.services
      const { values } = req.form
      const { decoratedLocation } = res.locals
      const { prisonId, parentId } = decoratedLocation

      const sanitizedLocalName = sanitizeString(String(values.localName))

      const validationErrors: FormWizard.Errors = {}

      try {
        const localNameExists = await locationsService.getLocationByLocalName(
          req.session.systemToken,
          String(prisonId),
          sanitizedLocalName,
          parentId,
        )
        if (localNameExists) {
          validationErrors.localName = this.formError('localName', 'taken')
          return callback({ ...errors, ...validationErrors })
        }
      } catch (error) {
        if (error.data.errorCode === 101) {
          return callback({ ...errors, ...validationErrors })
        }
      }
      return callback({ ...errors, ...validationErrors })
    })
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user, decoratedLocation } = res.locals
      const { locationsService } = req.services
      const { localName } = req.form.values

      const sanitizedLocalName = sanitizeString(String(localName))
      await locationsService.updateLocalName(
        req.session.systemToken,
        decoratedLocation.id,
        sanitizedLocalName,
        user.username,
      )

      decoratedLocation.localName = localName as string

      req.services.analyticsService.sendEvent(req, 'set_local_name', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { decoratedLocation } = res.locals

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Local name added',
      content: 'You have added a local name.',
    })

    res.redirect(paths.location.view(decoratedLocation))
  }
}
