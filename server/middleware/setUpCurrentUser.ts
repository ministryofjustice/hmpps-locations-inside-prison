import { Router } from 'express'
import { jwtDecode } from 'jwt-decode'
import { DprUser } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/DprUser'
import { convertToTitleCase } from '../utils/utils'
import logger from '../../logger'
import { Services } from '../services'

export default function setUpCurrentUser({ manageUsersService }: Services): Router {
  const router = Router({ mergeParams: true })

  router.use(async (req, res, next) => {
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

      const caseloadsData = await manageUsersService.getUserCaseloads(res.locals.user.token)
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

      const dprUser = new DprUser()
      dprUser.token = res.locals.user.token
      dprUser.id = caseloadsData.username
      dprUser.activeCaseLoadId = caseloadsData.activeCaseload.id
      dprUser.displayName = res.locals.user.displayName
      dprUser.staffId = res.locals.user.staffId
      res.locals.dprUser = dprUser

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  })

  return router
}
