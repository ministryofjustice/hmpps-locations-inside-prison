import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class CellConversionUsedFor extends FormInitialStep {
  override async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId } = res.locals.decoratedLocation
    const usedForTypes = await req.services.locationsService.getUsedForTypesForPrison(req.session.systemToken, prisonId)

    req.form.options.fields.usedForTypes.items = Object.values(usedForTypes).map(({ key, description }) => ({
      text: description,
      value: key,
    }))

    next()
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const usedForTypes = req.form.values.usedForTypes || req.sessionModel.get<string[]>('usedForTypes')
    const fields = { ...(locals.fields as FormWizard.Fields) }

    if (usedForTypes) {
      fields.usedForTypes.items = fields.usedForTypes.items.map(item => ({
        ...item,
        checked: (usedForTypes as string[]).includes(item.value as string),
      }))
    }

    return {
      ...locals,
      fields,
      title: 'Convert to cell',
      titleCaption: capFirst(res.locals.decoratedLocation.displayName),
    }
  }
}
