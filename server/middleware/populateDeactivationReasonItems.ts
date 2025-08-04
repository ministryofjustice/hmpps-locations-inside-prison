import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function populateDeactivationReasonItems(
  req: FormWizard.Request,
  _res: Response,
  next: NextFunction,
) {
  const { systemToken } = req.session
  const { locationsService } = req.services
  const { deactivationReason } = req.form.options.fields
  const deactivationReasons = await locationsService.getDeactivatedReasons(systemToken)
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
