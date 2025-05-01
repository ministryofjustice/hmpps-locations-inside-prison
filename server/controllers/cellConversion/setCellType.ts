import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class CellConversionSetCellType extends FormInitialStep {
  async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(token)

    req.form.options.fields.specialistCellTypes.items = Object.values(specialistCellTypes).map(
      ({ key, description, additionalInformation }) => ({
        text: description,
        value: key,
        hint: {
          text: additionalInformation,
        },
      }),
    )

    next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, unknown> {
    const locals = super.locals(req, res)
    const { sessionModel } = req
    const { location } = res.locals
    const { id: locationId, prisonId } = location
    const fields = { ...(locals.fields as FormWizard.Fields) }

    const specialistCellTypes = (req.form.values.specialistCellTypes ||
      sessionModel.get<string[]>('specialistCellTypes')) as string[]

    if (specialistCellTypes) {
      fields.specialistCellTypes.items = fields.specialistCellTypes.items.map(item => ({
        ...item,
        checked: specialistCellTypes.includes(item.value as string),
      }))
    }

    return {
      ...locals,
      buttonText: 'Continue',
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      fields,
    }
  }
}
