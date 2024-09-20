import { RequestHandler } from 'express'
import { rolesToPermissions } from '../lib/permissions'

export default function setCanAccess(): RequestHandler {
  return async (req, res, next) => {
    const { userRoles } = res.locals.user
    const permissions = rolesToPermissions(userRoles)

    req.canAccess = permission => permissions.includes(permission)
    res.locals.canAccess = req.canAccess

    next()
  }
}
