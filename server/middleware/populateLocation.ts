import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import logger from '../../logger'
import decorateLocation from '../decorators/location'

type LocationLocals = 'location' | 'cell'
const decoratedLocationLocalsMap: {
  location: 'decoratedLocation'
  cell: 'decoratedCell'
} = {
  location: 'decoratedLocation',
  cell: 'decoratedCell',
}
type PopulateLocationParams = {
  decorate?: boolean
  id?: string
  includeHistory?: boolean
  localName?: LocationLocals
}

export default function populateLocation({ decorate, id, includeHistory, localName }: PopulateLocationParams = {}) {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction): Promise<void> => {
    const { locationsService, manageUsersService } = req.services
    let location = res.locals[localName || 'location']

    try {
      const { systemToken } = req.session

      if (!location) {
        location = await req.services.locationsService.getLocation(
          systemToken,
          id || req.params.locationId || res.locals.locationId,
          includeHistory,
        )
      }

      if (!decorate) {
        res.locals[localName || 'location'] = location
        return next()
      }

      res.locals[decoratedLocationLocalsMap[localName || 'location']] = await decorateLocation({
        location,
        locationsService,
        manageUsersService,
        systemToken,
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
