import { type NextFunction, Request, type Response } from 'express'
import { rolesToPermissions } from '../lib/permissions'

const rolePriority = [
  'ROLES_ADMIN',
  'MANAGE_RES_LOCATIONS_OP_CAP',
  'MANAGE_RESIDENTIAL_LOCATIONS',
  'VIEW_INTERNAL_LOCATION',
]

export default function setCanAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userRoles } = res.locals.user
    const permissions = rolesToPermissions(userRoles)

    // A map of permission overrides, false = always disabled, true = always enabled
    const permissionOverrides: { [permission: string]: boolean | { [role: string]: boolean } } = {}
    if (!req.featureFlags?.permanentDeactivation) {
      permissionOverrides['deactivate:permanent'] = false
    }

    if (!req.featureFlags?.createAndCertify) {
      permissionOverrides.change_max_capacity = true
      permissionOverrides.convert_non_residential = {
        MANAGE_RESIDENTIAL_LOCATIONS: true,
      }
    }

    req.canAccess = permission => {
      if (permission in permissionOverrides) {
        const override = permissionOverrides[permission]
        if (typeof override === 'boolean') {
          return override
        }

        for (const role of rolePriority) {
          if (userRoles.includes(role) && role in override) {
            return override[role]
          }
        }
      }

      return permissions.includes(permission)
    }

    res.locals.canAccess = req.canAccess

    next()
  }
}
