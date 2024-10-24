import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class CellConversionUsedFor extends FormInitialStep {
  async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const { prisonId } = res.locals.location
    const usedForTypes = await req.services.locationsService.getUsedForTypesForPrison(token, prisonId)

    req.form.options.fields.usedForTypes.items = Object.values(usedForTypes).map(({ key, description }) => ({
      text: description,
      value: key,
    }))

    next()
  }

  locals(req: FormWizard.Request, res: Response): object {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const usedForTypes = req.sessionModel.get<string[]>('usedForTypes')
    const fields = { ...locals.fields }

    if (usedForTypes) {
      fields.usedForTypes.items = fields.usedForTypes.items.map((item: FormWizard.Field) => ({
        ...item,
        checked: usedForTypes.includes(item.value as string),
      }))
    }

    if (usedForTypes !== undefined && usedForTypes !== (req.body.usedForTypes || []))
      req.sessionModel.unset('usedForTypes')

    return {
      ...locals,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      fields,
    }
  }
}
