import { type NextFunction, Request, type Response } from 'express'
import { rolesToPermissions } from '../lib/permissions'
import LocationsService from '../services/locationsService'

const rolePriority = ['MANAGE_RES_LOCATIONS_OP_CAP', 'MANAGE_RESIDENTIAL_LOCATIONS', 'VIEW_INTERNAL_LOCATION']

export default function setCanAccess(locationService: LocationsService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userRoles } = res.locals.user
    const prisonId = res.locals.user.activeCaseload.id
    const { systemToken } = req.session
    const permissions = rolesToPermissions(userRoles)
    const prisonConfiguration = await locationService.getPrisonConfiguration(systemToken, prisonId)

    // A map of permission overrides, false = always disabled, true = always enabled
    const permissionOverrides: { [permission: string]: boolean | { [role: string]: boolean } } = {}

    if (!req.featureFlags?.permanentDeactivation) {
      permissionOverrides['deactivate:permanent'] = false
    }

    if (!req.featureFlags?.map2380) {
      permissionOverrides.change_max_capacity = true
      permissionOverrides.convert_non_residential = {
        MANAGE_RESIDENTIAL_LOCATIONS: true,
      }
    }
    if (!req.featureFlags?.createAndCertify || !prisonConfiguration.certificationApprovalRequired) {
      permissionOverrides.create_location = false
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
