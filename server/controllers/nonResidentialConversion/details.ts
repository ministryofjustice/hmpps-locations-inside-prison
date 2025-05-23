import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'

export default class NonResidentialConversionDetails extends FormInitialStep {
  middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const convertedCellTypes = await req.services.locationsService.getConvertedCellTypes(req.session.systemToken)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellTypes).map(({ key, description }) => ({
      value: key,
      text: description,
      conditional: key === 'OTHER' ? 'otherConvertedCellType' : undefined,
    }))

    next()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)

    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation

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
