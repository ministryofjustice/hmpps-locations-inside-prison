import config from '../config'
import paths from '../utils/paths'
import middleware from './middleware'

// Must stay in step with the roles granted `cell_certificate_upload_view` in server/lib/permissions.ts:
// this list decides which tiles are shown, that permission decides what the routes will actually serve.
const RESI_ROLES = [
  'VIEW_INTERNAL_LOCATION',
  'MANAGE_RESIDENTIAL_LOCATIONS',
  'MANAGE_RES_LOCATIONS_OP_CAP',
  'MANAGE_RES_LOCATIONS_ADMIN',
  'RESI__CERT_VIEWER',
  'RESI__CERT_REVIEWER',
]

export default middleware((req, res, next) => {
  const { user, prisonConfiguration, prisonId } = res.locals
  const certificationEnabled = prisonConfiguration?.certificationApprovalRequired === 'ACTIVE'
  const resiActive = prisonConfiguration?.resiLocationServiceActive === 'ACTIVE'
  const nonResiActive = prisonConfiguration?.nonResiServiceActive === 'ACTIVE'
  const userRoles = user.userRoles || []
  const hasResiRole = userRoles.some(role => RESI_ROLES.includes(role))
  const showResiCards = resiActive && hasResiRole

  const manageResiDescription = `View and update information about existing locations${certificationEnabled ? ' or create new residential locations' : ''}.`

  res.locals.resiCards = [
    {
      clickable: true,
      visible: showResiCards,
      heading: `Manage residential locations`,
      href: paths.location.view(prisonId),
      description: manageResiDescription,
      'data-qa': 'view-locations-card',
    },
    {
      clickable: true,
      visible: showResiCards,
      heading: 'View all inactive cells',
      href: paths.location.inactiveCells(prisonId),
      description: 'View details of all inactive cells in the establishment and reactivate them.',
      'data-qa': 'inactive-cells-card',
    },
    {
      clickable: true,
      visible: showResiCards,
      heading: 'Archived locations',
      href: paths.prison.archivedLocations(prisonId),
      description: 'View locations that have been permanently deactivated as residential locations.',
      'data-qa': 'archived-locations-card',
    },
    {
      clickable: true,
      visible: showResiCards && certificationEnabled,
      heading: 'Cell certificate',
      href: paths.cellCertificate.view(prisonId),
      description: 'View the current certificate and requested changes.',
      'data-qa': 'cell-certificate-card',
    },
    {
      clickable: true,
      // Deliberately not gated on certificationEnabled: ingesting a certificate is the onboarding step that
      // happens before certification is switched on, so gating it that way would hide it when it is needed.
      visible: showResiCards,
      heading: 'Cell certificate uploads',
      href: paths.prison.cellCertificateUploads(prisonId),
      description:
        'View cell certificates that have been uploaded for this establishment and the results of each upload.',
      'data-qa': 'cell-certificate-uploads-card',
    },
    {
      clickable: true,
      visible: req.canAccess('certificate_view_management'),
      heading: 'Capacity management dashboard',
      href: paths.capacityManagementDashboard,
      description: 'View a summary of cell certificates and change requests for every establishment.',
      'data-qa': 'capacity-management-dashboard-card',
    },
    {
      clickable: true,
      visible: req.canAccess('administer_residential'),
      heading: 'Admin',
      href: paths.admin.index(prisonId),
      description: 'Administer residential locations.',
      'data-qa': 'admin-card',
    },
    {
      clickable: true,
      visible: config.developerMode,
      heading: '[DEV] Set permissions',
      href: paths.dev.setPermissions,
      description: 'Set current user permissions (local dev only).',
      'data-qa': 'set-permissions-card',
    },
    {
      clickable: true,
      visible: config.developerMode && userRoles.includes('PERMISSION_OVERRIDE'),
      heading: '[DEV] Reset permissions',
      href: paths.dev.resetPermissions,
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
  if (nonResiActive) {
    // Check for non-resi specific roles (these are used by the non-resi app)
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
  } else {
    res.locals.nonResiCards = null
    res.locals.nonResiPermissionMessage = 'You do not have permission to view non-residential locations.'
  }

  next()
})
