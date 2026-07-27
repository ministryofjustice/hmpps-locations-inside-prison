import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../../base/formStep'
import paths from '../../../utils/paths'

export default class ReactivateCellsInit extends FormStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { selectedLocations } = req.query
    const { prisonId, locationId } = res.locals

    if (typeof selectedLocations === 'string') {
      res.redirect(
        `${paths.location.reactivate.cell(
          prisonId as string,
          selectedLocations,
        )}?ref=inactive-cells&refPrisonId=${prisonId}&refLocationId=${locationId}`,
      )

      return
    }

    if (selectedLocations?.length) {
      req.sessionModel.set('selectedLocations', selectedLocations)

      super.successHandler(req, res, next)
      return
    }

    res.redirect(paths.location.inactiveCells(prisonId as string, locationId as string))
  }
}
