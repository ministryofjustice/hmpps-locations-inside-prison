import { uniq } from 'lodash'

const viewInternalLocationPermissions: string[] = []

const manageResidentialLocationsPermissions: string[] = [
  'change_cell_capacity',
  'convert_non_residential',
  'set_cell_type',
  'change_used_for',
]

const manageResLocationsOpCapPermissions: string[] = [
  'change_cell_capacity',
  'change_signed_operational_capacity',
  'convert_non_residential',
  'deactivate_temporary',
  'set_cell_type',
  'change_used_for',
]

const permissionsByRole: { [key: string]: string[] } = {
  VIEW_INTERNAL_LOCATION: viewInternalLocationPermissions,
  MANAGE_RESIDENTIAL_LOCATIONS: manageResidentialLocationsPermissions,
  MANAGE_RES_LOCATIONS_OP_CAP: manageResLocationsOpCapPermissions,
}

const rolesToPermissions = (roles: string[], mapping = permissionsByRole) =>
  uniq(roles.map(role => mapping[role] || []).flat())

export { permissionsByRole, rolesToPermissions }
