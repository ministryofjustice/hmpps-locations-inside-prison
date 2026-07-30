import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'

export default class NonResidentialConversionDetails extends FormStep {
  override middlewareSetup() {
    this.use(this.setOptions)
    super.middlewareSetup()
  }

  async setOptions(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const convertedCellTypes = await req.services.locationsService.getConvertedCellTypes(req.session.systemToken)

    req.form.options.fields.convertedCellType.items = Object.values(convertedCellTypes).map(({ key, description }) => ({
      value: key,
      text: description,
      conditional: key === 'OTHER' ? 'otherConvertedCellType' : undefined,
    }))

    next()
  }

  override async saveValues(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const { values } = req.form

    req.sessionModel.set('convertedCellType', values.convertedCellType)
    if (values.convertedCellType === 'OTHER') {
      req.sessionModel.set('otherConvertedCellType', values.otherConvertedCellType)
    } else {
      req.sessionModel.unset('otherConvertedCellType')
    }

    if (values.explanation) {
      req.sessionModel.set('explanation', values.explanation)
    }

    next()
  }
}
