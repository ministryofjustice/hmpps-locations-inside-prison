import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import getCellPath from './getCellPath'

export default class WithoutSanitation extends BaseController {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.populateCheckboxes)
  }

  populateCheckboxes(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { sessionModel } = req
    const { options } = req.form
    const field = options.fields['create-cells_withoutSanitation']
    const cellsToCreate = Number(sessionModel.get<number>('create-cells_cellsToCreate'))
    const errorValues: { [key: string]: string[] } = req.sessionModel.get('errorValues') || {}
    const cellsWithoutSanitation =
      errorValues['create-cells_withoutSanitation'] ||
      sessionModel.get<string[]>('create-cells_withoutSanitation') ||
      []

    field.items = []
    for (let i = 0; i < cellsToCreate; i += 1) {
      field.items.push({
        text: getCellPath(req, res, i),
        value: i.toString(),
        checked: cellsWithoutSanitation.includes(i.toString()),
      })
    }

    next()
  }
}
