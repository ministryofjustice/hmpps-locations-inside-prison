import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../base/formInitialStep'
import populateLocation from '../../../middleware/populateLocation'

export default class RemoveCellType extends FormInitialStep {
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
      `/reactivate/location/${res.locals.decoratedLocation.id}/edit-capacity/${res.locals.decoratedLocation.id === cellId ? cellId : parentId}`,
    )
  }
}
