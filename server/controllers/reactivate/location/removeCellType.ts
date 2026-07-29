import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../../base/formStep'
import populateLocation from '../../../middleware/populateLocation'
import paths from '../../../utils/paths'

export default class RemoveCellType extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(this.populateCell)
  }

  private async populateCell(req: FormWizard.Request, res: Response, next: NextFunction) {
    await populateLocation({ id: req.params.cellId, localName: 'cell' })(req, res, next)
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { sessionModel } = req
    const { cellId } = req.params

    sessionModel.unset(`temp-cellTypes${cellId}`)
    sessionModel.set(`temp-cellTypes${cellId}-removed`, true)

    const { parentId } = res.locals.cell
    res.redirect(
      `${paths.location.reactivate.location(res.locals.decoratedLocation)}/edit-capacity/${res.locals.decoratedLocation.id === cellId ? cellId : parentId}`,
    )
  }
}
