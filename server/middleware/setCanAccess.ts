import { type NextFunction, Request, type Response } from 'express'
import { rolesToPermissions } from '../lib/permissions'
import LocationsService from '../services/locationsService'

const rolePriority = [
  'MANAGE_RES_LOCATIONS_ADMIN',
  'MANAGE_RES_LOCATIONS_OP_CAP',
  'MANAGE_RESIDENTIAL_LOCATIONS',
  'RESI_CERT_REVIEWER',
  'RESI_CERT_VIEWER',
]

export default function setCanAccess(locationService: LocationsService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userRoles } = res.locals.user
    const { systemToken } = req.session
    const permissions = rolesToPermissions(userRoles)
    const prisonIdFromParams = res.locals.user.activeCaseload.id

    // A map of permission overrides, false = always disabled, true = always enabled
    const permissionOverrides: { [permission: string]: boolean | { [role: string]: boolean } } = {}

    if (prisonIdFromParams !== undefined) {
      const prisonConfiguration = await locationService.getPrisonConfiguration(systemToken, prisonIdFromParams)
      if (prisonConfiguration.certificationApprovalRequired === 'INACTIVE') {
        permissionOverrides.create_location = false
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
