import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../controllers/base/formInitialStep'

export default class Init extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const pathPrefix = req.form.options.fullPath.replace(/\/set-cell-type\/.*/, '')
    const history = req.journeyModel.get('history') as FormWizard.HistoryStep[]

    // Add the categories page to the history, so that the journey doesn't get broken
    this.addJourneyHistoryStep(req, res, {
      path: history[history.length - 1].next,
      next: `${pathPrefix}/set-cell-type/:cellId/type`,
      wizard: req.form.options.name,
      revalidate: false,
      skip: false,
      editing: req.isEditing && !req.notRevalidated ? true : undefined,
      continueOnEdit: req.isEditing && !req.notRevalidated ? true : undefined,
    })

    super.successHandler(req, res, next)
  }
}
