import { type NextFunction, Request, type Response } from 'express'
import { rolesToPermissions } from '../lib/permissions'

export default function setCanAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userRoles } = res.locals.user
    const permissions = rolesToPermissions(userRoles)

    // A map of permission overrides, false = always disabled, true = always enabled
    const permissionOverrides: { [permission: string]: boolean } = {}
    if (!req.featureFlags?.permanentDeactivation) {
      permissionOverrides['deactivate:permanent'] = false
    }

    if (!req.featureFlags?.createAndCertify) {
      permissionOverrides.change_max_capacity = true
    }

    req.canAccess = permission => {
      if (permission in permissionOverrides) {
        return permissionOverrides[permission]
      }

      return permissions.includes(permission)
    }

    res.locals.canAccess = req.canAccess

    next()
  }
}
