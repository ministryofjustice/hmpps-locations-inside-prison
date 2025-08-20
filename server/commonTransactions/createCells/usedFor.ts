import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'

export default class UsedFor extends BaseController {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.populateCheckboxes)
  }

  async populateCheckboxes(req: FormWizard.Request, _res: Response, next: NextFunction) {
    const { fields } = req.form.options
    const { sessionModel } = req
    const errorValues: { [key: string]: string[] } = req.sessionModel.get('errorValues') || {}
    const fieldValues = errorValues['create-cells_usedFor'] || sessionModel.get<string[]>('create-cells_usedFor') || []

    const usedForTypes = await req.services.locationsService.getUsedForTypes(req.session.systemToken)

    fields['create-cells_usedFor'].items = usedForTypes.map(({ key, description }) => ({
      text: description,
      value: key,
      checked: fieldValues.includes(key),
    }))

    next()
  }
}
