import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default function populatePrisonersInLocation() {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction) => {
    const { location, user } = res.locals
    const token = await req.services.authService.getSystemClientToken(user.username)
    const [prisonerLocation] = await req.services.locationsService.getPrisonersInLocation(token, location.id)

    res.locals.prisonerLocation = prisonerLocation

    next()
  }
}
