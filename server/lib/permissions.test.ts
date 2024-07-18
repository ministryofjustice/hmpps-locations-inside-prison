import { rolesToPermissions } from './permissions'

describe('rolesToPermissions', () => {
  it('returns the correct permissions for VIEW_INTERNAL_LOCATION', () => {
    expect(rolesToPermissions(['VIEW_INTERNAL_LOCATION'])).toEqual([])
  })

  it('returns the correct permissions for MANAGE_RESIDENTIAL_LOCATIONS', () => {
    expect(rolesToPermissions(['MANAGE_RESIDENTIAL_LOCATIONS'])).toEqual(['change_cell_capacity'])
  })

  it('returns the correct permissions for MANAGE_RES_LOCATIONS_OP_CAP', () => {
    expect(rolesToPermissions(['MANAGE_RES_LOCATIONS_OP_CAP'])).toEqual(['change_cell_capacity'])
  })

  it('returns the correct permissions for all roles', () => {
    expect(
      rolesToPermissions(['VIEW_INTERNAL_LOCATION', 'MANAGE_RESIDENTIAL_LOCATIONS', 'MANAGE_RES_LOCATIONS_OP_CAP']),
    ).toEqual(['change_cell_capacity'])
  })
})
