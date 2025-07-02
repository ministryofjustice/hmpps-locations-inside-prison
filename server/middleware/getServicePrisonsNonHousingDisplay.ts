import { type NextFunction, Request, type Response } from 'express'
import logger from '../../logger'

export default function getServicePrisonsNonHousingDisplay() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { prisonId } = res.locals

    try {
      await req.services.prisonService.getServiceStatus(systemToken, prisonId, 'DISPLAY_HOUSING_CHECKBOX')
      // set switched off
      res.locals.prisonNonHousingDisplayEnabled = true
      next()
    } catch (error) {
      if (error.responseStatus === 404) {
        res.locals.prisonNonHousingDisplayEnabled = false
        next()
      } else {
        logger.error(error, `Failed to check prison service non housing display for prisonId: ${prisonId}`)
        next(error)
      }
    }
  }
}
