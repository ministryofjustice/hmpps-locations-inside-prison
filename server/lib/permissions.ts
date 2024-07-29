import { uniq } from 'lodash'

const viewInternalLocationPermissions: string[] = []

const manageResidentialLocationsPermissions: string[] = ['change_cell_capacity', 'set_cell_type']

const manageResLocationsOpCapPermissions: string[] = [
  'change_cell_capacity',
  'change_signed_operational_capacity',
  'set_cell_type',
]

const permissionsByRole: { [key: string]: string[] } = {
  VIEW_INTERNAL_LOCATION: viewInternalLocationPermissions,
  MANAGE_RESIDENTIAL_LOCATIONS: manageResidentialLocationsPermissions,
  MANAGE_RES_LOCATIONS_OP_CAP: manageResLocationsOpCapPermissions,
}

const rolesToPermissions = (roles: string[], mapping = permissionsByRole) =>
  uniq(roles.map(role => mapping[role] || []).flat())

export { permissionsByRole, rolesToPermissions }
