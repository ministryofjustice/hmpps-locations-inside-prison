import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'

export default class DeactivateTemporaryDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.populateItems)
    super.middlewareSetup()
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { authService, locationsService } = req.services
    const { deactivationReason } = req.form.options.fields
    const token = await authService.getSystemClientToken(user.username)
    const deactivationReasons = await locationsService.getDeactivatedReasons(token)
    deactivationReason.items = Object.entries(deactivationReasons)
      .sort(([a, _], [b, __]) => {
        if ([a, b].includes('OTHER')) {
          return a === 'OTHER' ? 1 : -1
        }

        return a.localeCompare(b)
      })
      .map(([key, value]) => ({
        text: value,
        value: key,
        conditional: `deactivationReason${key === 'OTHER' ? 'Other' : `Description-${key}`}`,
      }))

    Object.keys(deactivationReasons)
      .filter(n => n !== 'OTHER')
      .forEach(key => {
        req.form.options.allFields[`deactivationReasonDescription-${key}`] = {
          ...req.form.options.allFields.deactivationReasonDescription,
          id: `deactivationReasonDescription-${key}`,
          name: `deactivationReasonDescription-${key}`,
        }
      })

    delete req.form.options.allFields.deactivationReasonDescription

    next()
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    req.form.values.deactivationReasonDescription =
      req.body[`deactivationReasonDescription-${req.form.values.deactivationReason}`]

    super.validateFields(req, res, callback)
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { id: locationId, prisonId } = res.locals.location

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/location/${locationId}/deactivate/temporary/confirm`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }
}
