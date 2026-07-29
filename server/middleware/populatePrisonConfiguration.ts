import logger from '../../logger'
import asyncMiddleware from './asyncMiddleware'

export default asyncMiddleware(async (req, res, next) => {
  const { systemToken } = req.session
  const { prisonId } = res.locals

  try {
    res.locals.prisonConfiguration = await req.services.locationsService.getPrisonConfiguration(systemToken, prisonId)

    if (next) {
      next()
    }
  } catch (error) {
    logger.error(error, `Failed to populate prison configuration for: prisonId: ${prisonId}`)
    throw error
  }
})
