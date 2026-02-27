import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import getCells from './util/getCells'
import populateLocationTree from '../parent/middleware/populateLocationTree'
import getLocationResidentialSummary from '../parent/middleware/getLocationResidentialSummary'

export default class ReactivateLocationInit extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(populateLocationTree(false))
  }

  override async successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    let cells = getCells(res.locals.locationTree)
    const { parentLocation } = res.locals.locationResidentialSummary

    if (!cells.length && parentLocation.locationType === 'CELL') {
      cells = [parentLocation]
    }

    cells.forEach(({ id, specialistCellTypes }) => {
      if (specialistCellTypes.length) {
        req.sessionModel.set(`saved-cellTypes${id}`, specialistCellTypes)
      }
    })

    super.successHandler(req, res, next)
  }
}
