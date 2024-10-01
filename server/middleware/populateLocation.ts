import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import logger from '../../logger'
import decorateLocation from '../decorators/location'

type PopulateLocationParams = {
  decorate?: boolean
  includeHistory?: boolean
}

export default function populateLocation({ decorate, includeHistory }: PopulateLocationParams = {}) {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction): Promise<void> => {
    const { locationsService, manageUsersService } = req.services
    const { user } = res.locals
    let { location } = res.locals

    try {
      const token = await req.services.authService.getSystemClientToken(user.username)

      if (!location) {
        location = await req.services.locationsService.getLocation(token, req.params.locationId, includeHistory)
      }

      if (!decorate) {
        res.locals.location = location
        return next()
      }

      res.locals.location = await decorateLocation({
        location,
        locationsService,
        manageUsersService,
        systemToken: token,
        userToken: res.locals.user.token,
        limited: true,
      })
    } catch (error) {
      logger.error(
        error,
        `Failed to populate location for: prisonId: ${location?.prisonId}, locationId: ${location?.id}`,
      )
      next(error)
    }

    return next()
  }
}
