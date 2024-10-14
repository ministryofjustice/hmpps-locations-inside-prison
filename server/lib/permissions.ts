import { uniq } from 'lodash'

const viewInternalLocationPermissions: string[] = []

const manageResidentialLocationsPermissions: string[] = [
  ...viewInternalLocationPermissions,
  'change_cell_capacity',
  'convert_non_residential',
  'reactivate',
  'set_cell_type',
  'change_used_for',
  'change_local_name',
]

const manageResLocationsOpCapPermissions: string[] = [
  ...manageResidentialLocationsPermissions,
  'change_signed_operational_capacity',
  'deactivate_temporary',
]

const permissionsByRole: { [key: string]: string[] } = {
  VIEW_INTERNAL_LOCATION: viewInternalLocationPermissions,
  MANAGE_RESIDENTIAL_LOCATIONS: manageResidentialLocationsPermissions,
  MANAGE_RES_LOCATIONS_OP_CAP: manageResLocationsOpCapPermissions,
}

const rolesToPermissions = (roles: string[], mapping = permissionsByRole) =>
  uniq(roles.map(role => mapping[role] || []).flat())

export { permissionsByRole, rolesToPermissions }
