import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import backUrl from '../../utils/backUrl'
import { sanitizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class Details extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

    const fields = { ...(locals.fields as FormWizard.Fields) }
    fields.localName.value = (req.form.values.localName as string) || decoratedLocation.localName

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      title: 'Change local name',
      titleCaption: capFirst(decoratedLocation.displayName),
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
      const { prisonId, id: locationId, parentId } = decoratedLocation

      const sanitizedLocalName = sanitizeString(String(values.localName))

      const validationErrors: FormWizard.Errors = {}

      if (!sanitizedLocalName) {
        return callback({ ...errors, ...validationErrors })
      }
      if (sanitizeString(String(values.localName)) === sanitizeString(decoratedLocation.localName)) {
        return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
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
    const { id: locationId, prisonId } = res.locals.decoratedLocation
    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: 'Local name changed',
      content: `You have changed the local name.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
