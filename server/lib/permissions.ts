import { uniq } from 'lodash'

// Held by every residential role, including VIEW_INTERNAL_LOCATION which has no other permission. The set of
// roles granted these must stay identical to RESI_ROLES in server/middleware/populateCards.ts, because tile
// visibility and route access have to agree.
const residentialUserPermissions: string[] = ['cell_certificate_upload_view']

const cellStatusManagerPermissions: string[] = [
  ...residentialUserPermissions,
  'change_temporary_deactivation_details',
  'reactivate',
  'deactivate',
]

const certificateViewerPermissions: string[] = [
  ...residentialUserPermissions,
  'certificate_view_management',
  'cell_certificate_upload_create',
]

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

const certificateReviewerPermissions: string[] = [...residentialUserPermissions, 'certificate_change_request_review']

const administerResLocationsPermissions: string[] = [
  ...residentialUserPermissions,
  'administer_residential',
  'cell_certificate_upload_create',
]

const permissionsByRole: { [key: string]: string[] } = {
  VIEW_INTERNAL_LOCATION: residentialUserPermissions,
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
