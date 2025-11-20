import { uniq } from 'lodash'

const cellStatusManagerPermissions: string[] = ['change_temporary_deactivation_details', 'reactivate', 'deactivate']

const certificateViewerPermissions: string[] = ['certificate_view_management']

const certificateAdministratorPermissions: string[] = [
  ...cellStatusManagerPermissions,
  ...certificateViewerPermissions,
  'change_cell_capacity',
  'change_local_name',
  'change_location_code',
  'change_non_residential_type',
  'change_used_for',
  'set_cell_type',
  'create_location',
  'certificate_change_request_create',
  'certificate_change_request_withdraw',
  'change_max_capacity',
  'change_signed_operational_capacity',
  'convert_non_residential',
  'deactivate:permanent',
]

const certificateReviewerPermissions: string[] = [...certificateViewerPermissions, 'certificate_change_request_review']

const reportingLocationInformationPermissions: string[] = ['reporting_location_information']

const administerResLocationsPermissions: string[] = [
  ...reportingLocationInformationPermissions,
  'administer_residential',
]

const permissionsByRole: { [key: string]: string[] } = {
  MANAGE_RESIDENTIAL_LOCATIONS: cellStatusManagerPermissions,
  MANAGE_RES_LOCATIONS_OP_CAP: certificateAdministratorPermissions,
  RESI__CERT_REVIEWER: certificateReviewerPermissions,
  RESI__CERT_VIEWER: certificateViewerPermissions,
  REPORTING_LOCATION_INFORMATION: reportingLocationInformationPermissions,
  MANAGE_RES_LOCATIONS_ADMIN: administerResLocationsPermissions,
}

const rolesToPermissions = (roles: string[], mapping = permissionsByRole) =>
  uniq(roles.map(role => mapping[role] || []).flat())

export { permissionsByRole, rolesToPermissions }
