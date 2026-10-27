import { type NextFunction, Request, type Response } from 'express'
import { Services } from '../services'
import decorateLocation from '../decorators/location'
import logger from '../../logger'
import addUsersToUserMap from './addUsersToUserMap'

export default function populateArchivedLocations({ locationsService, manageUsersService }: Services) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { user, prisonId } = res.locals

    try {
      const locations = await Promise.all(
        ((await locationsService.getArchivedLocations(systemToken, prisonId)) || []).map(location =>
          decorateLocation({
            location,
            systemToken,
            userToken: user.token,
            manageUsersService,
            locationsService,
            lookUpUsers: false,
          }),
        ),
      )

      await addUsersToUserMap(locations.map(l => l.deactivatedBy).filter(u => u))(req, res)
      res.locals.archivedLocations = locations.map(l => ({
        ...l,
        deactivatedBy: l.deactivatedBy && res.locals.userMap[l.deactivatedBy],
      }))

      next()
    } catch (error) {
      logger.error(error, `Failed to populate archived locations for: prisonId: ${prisonId}`)
      next(error)
    }
  }
}
