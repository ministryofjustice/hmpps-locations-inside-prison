import { type NextFunction, Request, type Response } from 'express'
import { Services } from '../services'
import decorateLocation from '../decorators/location'
import logger from '../../logger'
import addUsersToUserMap from './addUsersToUserMap'

export default function populateInactiveCells({ locationsService, manageUsersService }: Services) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { user, prisonId, locationId } = res.locals

    try {
      const locations = await Promise.all(
        ((await locationsService.getInactiveCells(systemToken, prisonId, locationId)) || []).map(location =>
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
      res.locals.inactiveCells = locations.map(l => ({
        ...l,
        deactivatedBy: l.deactivatedBy && res.locals.userMap[l.deactivatedBy],
      }))

      next()
    } catch (error) {
      logger.error(
        error,
        `Failed to populate inactive cells for: prisonId: ${prisonId}, locationId: ${req.params.locationId}`,
      )
      next(error)
    }
  }
}
