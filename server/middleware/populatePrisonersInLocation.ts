import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default function populatePrisonersInLocation() {
  return async (req: Request | FormWizard.Request, res: Response, next?: NextFunction) => {
    const { decoratedLocation, location } = res.locals
    const locationId = (decoratedLocation || location).id || req.params.locationId || res.locals.locationId
    const [prisonerLocation] = await req.services.locationsService.getPrisonersInLocation(
      req.session.systemToken,
      locationId as string,
    )

    res.locals.prisonerLocation = prisonerLocation

    if (next) {
      next()
    }
  }
}
