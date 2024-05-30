import { RequestHandler } from 'express'
import logger from '../../logger'
import { Services } from '../services'

export default function populateResidentialSummary({ authService, locationsService }: Services): RequestHandler {
  return async (req, res, next) => {
    try {
      const { user, prisonId } = res.locals
      if (!user.caseloads.find(caseload => caseload.id === prisonId)) {
        next(new Error('Caseload is not accessible by this user.'))
        return
      }

      const token = await authService.getSystemClientToken(res.locals.user.username)

      const accommodationTypesMap = Object.fromEntries(
        (await locationsService.getAccommodationTypes(token)).accommodationTypes.map(i => [i.key, i.description]),
      )
      const usedForMap = Object.fromEntries(
        (await locationsService.getUsedForTypes(token)).usedForTypes.map(i => [i.key, i.description]),
      )
      const residentialSummary = await locationsService.getResidentialSummary(token, prisonId)
      residentialSummary.subLocations = residentialSummary.subLocations.map(location => {
        return {
          ...location,
          accommodationTypes: location.accommodationTypes.map(a => accommodationTypesMap[a]).filter(a => a),
          usedFor: location.usedFor.map(u => usedForMap[u]).filter(u => u),
        }
      })
      res.locals.residentialSummary = residentialSummary

      next()
    } catch (error) {
      logger.error(error, `Failed to populate residential summary for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
