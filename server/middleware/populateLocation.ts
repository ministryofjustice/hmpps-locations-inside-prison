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
  includeCurrentCertificate?: boolean
  includeHistory?: boolean
  localName?: LocationLocals
}

export default function populateLocation({
  decorate,
  id,
  includeCurrentCertificate,
  includeHistory,
  localName,
}: PopulateLocationParams = {}) {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction): Promise<void> => {
    const { locationsService, manageUsersService } = req.services
    let location =
      res.locals[localName || 'location'] || res.locals[decoratedLocationLocalsMap[localName || 'location']]?.raw
    const locationId = id || req.params.locationId || res.locals.locationId || location?.id

    try {
      const { systemToken } = req.session

      if (!location || (includeCurrentCertificate && !location.currentCellCertificate) || location?.id !== locationId) {
        location = await req.services.locationsService.getLocation(
          systemToken,
          locationId,
          includeHistory,
          includeCurrentCertificate,
        )
      }

      res.locals[localName || 'location'] = location
      if (!decorate) {
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
