import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import freeTextInput from '../../presenters/freeTextInput'

export default class NonResidentialConversionDetails extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setOptions)
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const token = await req.services.authService.getSystemClientToken(res.locals.user.username)
    const convertedCellTypes = await req.services.locationsService.getConvertedCellTypes(token)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellTypes).map(({ key, description }) => {
      if (key !== 'OTHER') {
        return { text: description, value: key }
      }

      const fieldConfig: any = {
        id: 'otherConvertedCellType',
        name: 'otherConvertedCellType',
        type: 'text',
        autocomplete: 'off',
        label: {
          text: 'Room description',
        },
      }

      const errors = req.sessionModel.get('errors') as { [key: string]: { args: any; key: string; type: string } }
      if (errors?.otherConvertedCellType?.type === 'required') {
        fieldConfig.errorMessage = { text: 'Enter a room description' }
      }

      const value = req.sessionModel.get('otherConvertedCellType')
      if (value) {
        fieldConfig.value = value
      }

      const otherFreeText = freeTextInput(fieldConfig)

      return {
        text: description,
        value: key,
        conditional: {
          html: otherFreeText,
        },
      }
    })

    next()
  }

  locals(req: FormWizard.Request, res: Response): Record<string, any> {
    const locals = super.locals(req, res)

    const { location } = res.locals
    const { id: locationId, prisonId } = location

    return {
      ...locals,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { options, values } = req.form
    const { items } = options.fields.convertedCellType
    const convertedCellType = items.find(item => item.value === values.convertedCellType)
    req.sessionModel.set('convertedCellType', convertedCellType)
    req.sessionModel.set('otherConvertedCellType', values.otherConvertedCellType)

    next()
  }
}
