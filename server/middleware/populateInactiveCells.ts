import { RequestHandler } from 'express'
import { Services } from '../services'
import decorateLocation from '../decorators/location'
import logger from '../../logger'

export default function populateInactiveCells({
  authService,
  locationsService,
  manageUsersService,
}: Services): RequestHandler {
  return async (req, res, next) => {
    const { user, prisonId } = res.locals

    try {
      const token = await authService.getSystemClientToken(user.username)
      res.locals.inactiveCells = await Promise.all(
        (await locationsService.getInactiveCells(token, prisonId, req.params.locationId)).map(location =>
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
      logger.error(error, `Failed to populate inactive cells for: ${user?.username}`)
      next(error)
    }
  }
}
