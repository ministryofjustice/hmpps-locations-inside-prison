import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class CellConversionSetCellType extends FormInitialStep {
  override async configure(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const specialistCellTypes = await req.services.locationsService.getSpecialistCellTypes(req.session.systemToken)

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

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { sessionModel } = req
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
      fields,
    }
  }
}
