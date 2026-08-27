import { uniq } from 'lodash'

const cellStatusManagerPermissions: string[] = ['change_temporary_deactivation_details', 'reactivate', 'deactivate']

// Reaching the cell certificate import pages at all means being able to run an import, so a single
// permission covers the area. The results of an import are shown to a wider audience on the import
// request details page instead, which carries no permission of its own.
const certificateViewerPermissions: string[] = ['certificate_view_management', 'cell_certificate_import']

const certificateAdministratorPermissions: string[] = [
  ...cellStatusManagerPermissions,
  'change_cell_capacity',
  'change_door_number',
  'change_local_name',
  'change_location_code',
  'change_non_residential_type',
  'change_sanitation',
  'change_signed_operational_capacity',
  'change_used_for',
  'certificate_change_request_create',
  'certificate_change_request_withdraw',
  'convert_non_residential',
  'create_location',
  'deactivate:permanent',
  'deactivate:parent_location',
  'set_cell_type',
  'archive_location',
]

const certificateReviewerPermissions: string[] = ['certificate_change_request_review']

const administerResLocationsPermissions: string[] = ['administer_residential', 'cell_certificate_import']

const permissionsByRole: { [key: string]: string[] } = {
  MANAGE_RESIDENTIAL_LOCATIONS: cellStatusManagerPermissions,
  MANAGE_RES_LOCATIONS_OP_CAP: certificateAdministratorPermissions,
  RESI__CERT_REVIEWER: certificateReviewerPermissions,
  RESI__CERT_VIEWER: certificateViewerPermissions,
  MANAGE_RES_LOCATIONS_ADMIN: administerResLocationsPermissions,
}

const permissionNameMap: { [p: string]: string } = {
  MANAGE_RESIDENTIAL_LOCATIONS: 'Cell status manager',
  MANAGE_RES_LOCATIONS_OP_CAP: 'Certificate administrator',
  RESI__CERT_REVIEWER: 'Certificate reviewer',
  RESI__CERT_VIEWER: 'Certificate viewer',
  REPORTING_LOCATION_INFORMATION: 'Reporting location information',
  MANAGE_RES_LOCATIONS_ADMIN: 'Residential locations administrator',
  NONRESI__MAINTAIN_LOCATION: 'Non-residential maintainer',
}

const rolesToPermissions = (roles: string[], mapping = permissionsByRole) =>
  uniq(roles.map(role => mapping[role] || []).flat())

export { permissionsByRole, permissionNameMap, rolesToPermissions }
