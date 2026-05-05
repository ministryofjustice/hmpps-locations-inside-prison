import asyncMiddleware from './asyncMiddleware'
import setCanAccess from './setCanAccess'
import LocationsService from '../services/locationsService'
import config from '../config'

const RESI_ROLES = [
  'VIEW_INTERNAL_LOCATION',
  'MANAGE_RESIDENTIAL_LOCATIONS',
  'MANAGE_RES_LOCATIONS_OP_CAP',
  'MANAGE_RES_LOCATIONS_ADMIN',
  'RESI__CERT_VIEWER',
  'RESI__CERT_REVIEWER',
]

export default function populateCards(locationsService: LocationsService) {
  return asyncMiddleware((req, res, next) => {
    setCanAccess(locationsService)
    const certificationEnabled = res.locals.prisonConfiguration?.certificationApprovalRequired === 'ACTIVE'
    const resiActive = res.locals.prisonConfiguration?.resiLocationServiceActive === 'ACTIVE'
    const nonResiActive = res.locals.prisonConfiguration?.nonResiServiceActive === 'ACTIVE'
    const userRoles = res.locals.user.userRoles || []
    const hasResiRole = userRoles.some(role => RESI_ROLES.includes(role))
    const showResiCards = resiActive && hasResiRole

    // Residential locations cards and permission message
    let manageLocationsCard = null
    if (showResiCards) {
      if (certificationEnabled) {
        manageLocationsCard = {
          clickable: true,
          visible: true,
          heading: 'Manage residential locations',
          href: `/view-and-update-locations`,
          description: 'View and update information about existing locations or create new residential locations.',
          'data-qa': 'manage-locations-card',
        }
      } else {
        manageLocationsCard = {
          clickable: true,
          visible: true,
          heading: `Manage residential locations`,
          href: `/view-and-update-locations`,
          description: 'View and update information about existing locations or create new residential locations.',
          'data-qa': 'view-locations-card',
        }
      }
    }

    res.locals.resiCards = [
      manageLocationsCard,
      {
        clickable: true,
        visible: showResiCards,
        heading: 'View all inactive cells',
        href: '/inactive-cells',
        description: 'View details of all inactive cells in the establishment and reactivate them.',
        'data-qa': 'inactive-cells-card',
      },
      {
        clickable: true,
        visible: showResiCards,
        heading: 'Archived locations',
        href: '/archived-locations',
        description: 'View locations that have been permanently deactivated as residential locations.',
        'data-qa': 'archived-locations-card',
      },
      {
        clickable: true,
        visible: showResiCards && certificationEnabled,
        heading: 'Cell certificate',
        href: '/cell-certificate/current',
        description: 'View the current certificate and requested changes.',
        'data-qa': 'cell-certificate-card',
      },
      {
        clickable: true,
        visible: req.canAccess('administer_residential'),
        heading: 'Admin',
        href: '/admin',
        description: 'Administer residential locations.',
        'data-qa': 'admin-card',
      },
      {
        clickable: true,
        visible: config.developerMode,
        heading: '[DEV] Set permissions',
        href: '/dev-set-permissions',
        description: 'Set current user permissions (local dev only).',
        'data-qa': 'set-permissions-card',
      },
      {
        clickable: true,
        visible: config.developerMode && res.locals.user.userRoles.includes('PERMISSION_OVERRIDE'),
        heading: '[DEV] Reset permissions',
        href: '/dev-reset-permissions',
        description: 'Reset current user permissions (local dev only).',
        'data-qa': 'reset-permissions-card',
      },
    ]

    if (!resiActive) {
      res.locals.resiPermissionMessage = 'You do not have permission to view Residential locations.'
    } else if (!hasResiRole) {
      res.locals.resiPermissionMessage = 'You do not have permission to manage Residential locations.'
    } else {
      res.locals.resiPermissionMessage = null
    }

    // Non-residential locations cards and permission message
    if (req.featureFlags.nonResi && nonResiActive) {
      // Check for non-resi specific roles (these are used by the non-resi app)
      const userRoles = res.locals.user.userRoles || []
      const hasEditRole = userRoles.includes('NONRESI__MAINTAIN_LOCATION')

      res.locals.nonResiCards = [
        hasEditRole
          ? {
              clickable: true,
              visible: true,
              heading: 'Edit non-residential locations',
              href: config.services.nonResidentialLocations,
              description: 'Add, change or archive non-residential locations.',
              'data-qa': 'non-resi-edit-card',
            }
          : {
              clickable: true,
              visible: true,
              heading: 'View non-residential locations',
              href: config.services.nonResidentialLocations,
              description: 'View non-residential locations and the services that use them.',
              'data-qa': 'non-resi-view-card',
            },
      ]
      res.locals.nonResiPermissionMessage = null
    } else if (req.featureFlags.nonResi) {
      res.locals.nonResiCards = null
      res.locals.nonResiPermissionMessage = 'You do not have permission to view non-residential locations.'
    } else {
      res.locals.nonResiCards = null
      res.locals.nonResiPermissionMessage = null
    }

    next()
  })
}
