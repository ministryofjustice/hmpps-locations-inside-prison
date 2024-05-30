import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import { convertToTitleCase } from '../utils/utils'
import { dataAccess } from '../data'

export default function populateCurrentUser(): RequestHandler {
  return async (req, res, next) => {
    try {
      const {
        name,
        user_id: userId,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        authorities?: string[]
      }
      const { manageUsersApiClient } = dataAccess()

      const caseloadsData = await manageUsersApiClient.users.me.getCaseloads(res.locals.user.token)
      res.locals.user = {
        ...res.locals.user,
        userId,
        name,
        displayName: `${convertToTitleCase(name)}`,
        userRoles: roles.map(role => role.substring(role.indexOf('_') + 1)),
        activeCaseload: caseloadsData.activeCaseload,
        caseloads: caseloadsData.caseloads,
      }

      if (res.locals.user.authSource === 'nomis') {
        res.locals.user.staffId = parseInt(userId, 10) || undefined
      }

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
