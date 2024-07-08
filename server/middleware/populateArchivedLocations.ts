import { RequestHandler } from 'express'
import { Services } from '../services'
import decorateLocation from '../decorators/location'
import logger from '../../logger'

export default function populateArchivedLocations({
  authService,
  locationsService,
  manageUsersService,
}: Services): RequestHandler {
  return async (req, res, next) => {
    const { user, prisonId } = res.locals

    try {
      const token = await authService.getSystemClientToken(user.username)
      res.locals.archivedLocations = await Promise.all(
        ((await locationsService.getArchivedLocations(token, prisonId)) || []).map(location =>
          decorateLocation({
            location,
            systemToken: token,
            userToken: res.locals.user.token,
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
