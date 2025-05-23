import { type NextFunction, Request, type Response } from 'express'
import { Services } from '../services'
import decorateLocation from '../decorators/location'
import logger from '../../logger'

export default function populateArchivedLocations({ locationsService, manageUsersService }: Services) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { user, prisonId } = res.locals

    try {
      res.locals.archivedLocations = await Promise.all(
        ((await locationsService.getArchivedLocations(systemToken, prisonId)) || []).map(location =>
          decorateLocation({
            location,
            systemToken,
            userToken: user.token,
            manageUsersService,
            locationsService,
          }),
        ),
      )

      next()
    } catch (error) {
      logger.error(error, `Failed to populate archived locations for: prisonId: ${prisonId}`)
      next(error)
    }
  }
}
