import { uniq } from 'lodash'

const viewInternalLocationPermissions: string[] = []

const reportingLocationInformationPermissions: string[] = [
  ...viewInternalLocationPermissions,
  'reporting_location_information',
]

const manageResidentialLocationsPermissions: string[] = [
  ...viewInternalLocationPermissions,
  'change_cell_capacity',
  'change_local_name',
  'change_non_residential_type',
  'change_temporary_deactivation_details',
  'change_used_for',
  'deactivate',
  'reactivate',
  'set_cell_type',
]

const manageResLocationsOpCapPermissions: string[] = [
  ...manageResidentialLocationsPermissions,
  'change_max_capacity',
  'change_signed_operational_capacity',
  'convert_non_residential',
  'deactivate:permanent',
]

const administerResLocationsPermissions: string[] = [...manageResLocationsOpCapPermissions, 'administer_residential']

const permissionsByRole: { [key: string]: string[] } = {
  VIEW_INTERNAL_LOCATION: viewInternalLocationPermissions,
  MANAGE_RESIDENTIAL_LOCATIONS: manageResidentialLocationsPermissions,
  MANAGE_RES_LOCATIONS_OP_CAP: manageResLocationsOpCapPermissions,
  REPORTING_LOCATION_INFORMATION: reportingLocationInformationPermissions,
  MANAGE_RES_LOCATIONS_ADMIN: administerResLocationsPermissions,
}

const rolesToPermissions = (roles: string[], mapping = permissionsByRole) =>
  uniq(roles.map(role => mapping[role] || []).flat())

export { permissionsByRole, rolesToPermissions }
