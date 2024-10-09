import { rolesToPermissions } from './permissions'

describe('rolesToPermissions', () => {
  it('returns the correct permissions for VIEW_INTERNAL_LOCATION', () => {
    expect(rolesToPermissions(['VIEW_INTERNAL_LOCATION'])).toEqual([])
  })

  it('returns the correct permissions for MANAGE_RESIDENTIAL_LOCATIONS', () => {
    expect(rolesToPermissions(['MANAGE_RESIDENTIAL_LOCATIONS']).sort()).toEqual([
      'change_cell_capacity',
      'change_non_residential_type',
      'change_used_for',
      'convert_non_residential',
      'reactivate',
      'set_cell_type',
    ])
  })

  it('returns the correct permissions for MANAGE_RES_LOCATIONS_OP_CAP', () => {
    expect(rolesToPermissions(['MANAGE_RES_LOCATIONS_OP_CAP']).sort()).toEqual([
      'change_cell_capacity',
      'change_non_residential_type',
      'change_signed_operational_capacity',
      'change_temporary_deactivation_details',
      'change_used_for',
      'convert_non_residential',
      'deactivate_temporary',
      'reactivate',
      'set_cell_type',
    ])
  })

  it('returns the correct permissions for all roles', () => {
    expect(
      rolesToPermissions([
        'VIEW_INTERNAL_LOCATION',
        'MANAGE_RESIDENTIAL_LOCATIONS',
        'MANAGE_RES_LOCATIONS_OP_CAP',
      ]).sort(),
    ).toEqual([
      'change_cell_capacity',
      'change_non_residential_type',
      'change_signed_operational_capacity',
      'change_temporary_deactivation_details',
      'change_used_for',
      'convert_non_residential',
      'deactivate_temporary',
      'reactivate',
      'set_cell_type',
    ])
  })
})
