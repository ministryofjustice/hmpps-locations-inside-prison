import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'

export default class DeactivateTemporaryDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.populateItems)
    super.middlewareSetup()
    this.use(this.differentiateConditionalFields)
  }

  differentiateConditionalFields(req: FormWizard.Request, res: Response, next: NextFunction) {
    // make validation of description apply to all of the reasons except for other, without this, the validation only
    // applies to the last reason
    req.form.options.fields.deactivationReasonDescription.dependent.value =
      req.form.options.fields.deactivationReason.items.map(r => r.value).filter(v => v !== 'OTHER')

    req.form.options.fields.deactivationReason.items.forEach(item => {
      const { conditional } = item
      if (typeof conditional === 'string' || Array.isArray(conditional)) {
        return
      }

      conditional.html = conditional.html.replace(
        /deactivationReasonDescription/g,
        `deactivationReasonDescription-${item.value}`,
      )
    })

    next()
  }

  setDescriptionFields(req: FormWizard.Request) {
    const reason = req.form.options.fields.deactivationReason.value
    if (!reason) {
      return
    }

    const descriptionItemConditional = req.form.options.fields.deactivationReason.items.find(i => i.value === reason)
      ?.conditional as { html: string }
    if (!descriptionItemConditional) {
      return
    }

    const value = req.form.options.fields[`deactivationReason${reason === 'OTHER' ? 'Other' : 'Description'}`]
      .value as string
    descriptionItemConditional.html = descriptionItemConditional.html.replace(
      'type="text"',
      `type="text" value="${value?.replace(/"/g, '&quot;') || ''}"`,
    )
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { authService, locationsService } = req.services
    const { deactivationReason } = req.form.options.fields
    const token = await authService.getSystemClientToken(user.username)
    deactivationReason.items = Object.entries(await locationsService.getDeactivatedReasons(token))
      .sort(([a, _], [b, __]) => {
        if ([a, b].includes('OTHER')) {
          return a === 'OTHER' ? 1 : -1
        }

        return a.localeCompare(b)
      })
      .map(([key, value]) => ({
        text: value,
        value: key,
        conditional: `deactivationReason${key === 'OTHER' ? 'Other' : 'Description'}`,
      }))

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

  render(req: FormWizard.Request, res: Response, next: NextFunction) {
    this.setDescriptionFields(req)

    return super.render(req, res, next)
  }
}
