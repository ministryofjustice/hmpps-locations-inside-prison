import { type NextFunction, Request, type Response } from 'express'
import { Services } from '../services'
import decorateLocation from '../decorators/location'
import logger from '../../logger'

export default function populateInactiveCells({ locationsService, manageUsersService }: Services) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { user, prisonId } = res.locals

    try {
      res.locals.inactiveCells = await Promise.all(
        ((await locationsService.getInactiveCells(systemToken, prisonId, req.params.locationId)) || []).map(location =>
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
      logger.error(
        error,
        `Failed to populate inactive cells for: prisonId: ${prisonId}, locationId: ${req.params.locationId}`,
      )
      next(error)
    }
  }
}
