import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'

export default class ReactivateCellsInit extends FormInitialStep {
  override render(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationId, prisonId, selectedLocations } = req.query

    if (typeof selectedLocations === 'string') {
      res.redirect(
        `/reactivate/cell/${selectedLocations}?ref=inactive-cells&refPrisonId=${prisonId}&refLocationId=${locationId}`,
      )

      return
    }

    if (selectedLocations?.length) {
      req.sessionModel.set('referrerLocationId', locationId)
      req.sessionModel.set('referrerPrisonId', prisonId)
      req.sessionModel.set('selectedLocations', selectedLocations)

      this.successHandler(req, res, next)
      return
    }

    res.redirect(`/inactive-cells/${[prisonId, locationId].filter(i => i).join('/')}`)
  }
}
