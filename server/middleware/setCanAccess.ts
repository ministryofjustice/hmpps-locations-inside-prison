import { RequestHandler } from 'express'
import { rolesToPermissions } from '../lib/permissions'

export default function setCanAccess(): RequestHandler {
  return async (req, res, next) => {
    const { userRoles } = res.locals.user
    const permissions = rolesToPermissions(userRoles)

    const disabledPermissions: string[] = []
    if (!req.featureFlags?.permanentDeactivation) {
      disabledPermissions.push('deactivate:permanent')
    }

    req.canAccess = permission => !disabledPermissions.includes(permission) && permissions.includes(permission)

    res.locals.canAccess = req.canAccess

    next()
  }
}
