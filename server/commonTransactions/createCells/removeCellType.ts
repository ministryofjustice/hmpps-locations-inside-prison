import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../../controllers/base/formInitialStep'

export default class RemoveCellType extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { sessionModel } = req
    const { cellId } = req.params
    const normalCellTypes = `create-cells_set-cell-type_normalCellTypes${cellId}`
    const specialCellTypes = `create-cells_set-cell-type_specialistCellTypes${cellId}`
    const cellAccommodationType = `create-cells_set-cell-type_accommodationType${cellId}`

    sessionModel.unset(normalCellTypes)
    sessionModel.unset(cellAccommodationType)
    sessionModel.unset(specialCellTypes)

    super.successHandler(req, res, next)
  }
}
