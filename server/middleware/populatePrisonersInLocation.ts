import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default function populatePrisonersInLocation() {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction) => {
    const { decoratedLocation, location } = res.locals
    const [prisonerLocation] = await req.services.locationsService.getPrisonersInLocation(
      req.session.systemToken,
      (decoratedLocation || location).id,
    )

    res.locals.prisonerLocation = prisonerLocation

    next()
  }
}
