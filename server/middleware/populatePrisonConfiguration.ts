import { type NextFunction, Request, type Response } from 'express'
import logger from '../../logger'

export default function populatePrisonConfiguration() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { prisonId } = res.locals

    try {
      res.locals.prisonConfiguration = await req.services.locationsService.getPrisonConfiguration(systemToken, prisonId)

      next()
    } catch (error) {
      logger.error(error, `Failed to populate prison configuration for: prisonId: ${prisonId}`)
      next(error)
    }
  }
}
