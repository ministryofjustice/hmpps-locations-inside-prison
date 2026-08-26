import { rolesToPermissions } from './permissions'

describe('rolesToPermissions', () => {
  it('returns the correct permissions for MANAGE_RESIDENTIAL_LOCATIONS', () => {
    expect(rolesToPermissions(['MANAGE_RESIDENTIAL_LOCATIONS']).sort()).toEqual([
      'cell_certificate_upload_view',
      'change_temporary_deactivation_details',
      'deactivate',
      'reactivate',
    ])
  })

  it('returns the correct permissions for MANAGE_RES_LOCATIONS_OP_CAP', () => {
    expect(rolesToPermissions(['MANAGE_RES_LOCATIONS_OP_CAP']).sort()).toEqual([
      'archive_location',
      'cell_certificate_upload_view',
      'certificate_change_request_create',
      'certificate_change_request_withdraw',
      'change_cell_capacity',
      'change_door_number',
      'change_local_name',
      'change_location_code',
      'change_non_residential_type',
      'change_sanitation',
      'change_signed_operational_capacity',
      'change_temporary_deactivation_details',
      'change_used_for',
      'convert_non_residential',
      'create_location',
      'deactivate',
      'deactivate:parent_location',
      'deactivate:permanent',
      'reactivate',
      'set_cell_type',
    ])
  })

  it('returns the correct permissions for RESI__CERT_REVIEWER', () => {
    expect(rolesToPermissions(['RESI__CERT_REVIEWER']).sort()).toEqual([
      'cell_certificate_upload_view',
      'certificate_change_request_review',
    ])
  })

  it('returns the correct permissions for RESI__CERT_VIEWER', () => {
    expect(rolesToPermissions(['RESI__CERT_VIEWER']).sort()).toEqual([
      'cell_certificate_upload_create',
      'cell_certificate_upload_view',
      'certificate_view_management',
    ])
  })

  it('returns the correct permissions for MANAGE_RES_LOCATIONS_ADMIN', () => {
    expect(rolesToPermissions(['MANAGE_RES_LOCATIONS_ADMIN']).sort()).toEqual([
      'administer_residential',
      'cell_certificate_upload_create',
      'cell_certificate_upload_view',
    ])
  })

  it('grants VIEW_INTERNAL_LOCATION only the ability to view uploads', () => {
    expect(rolesToPermissions(['VIEW_INTERNAL_LOCATION']).sort()).toEqual(['cell_certificate_upload_view'])
  })

  it('returns the correct permissions for all roles', () => {
    expect(
      rolesToPermissions([
        'MANAGE_RESIDENTIAL_LOCATIONS',
        'MANAGE_RES_LOCATIONS_OP_CAP',
        'RESI__CERT_REVIEWER',
        'RESI__CERT_VIEWER',
        'MANAGE_RES_LOCATIONS_ADMIN',
      ]).sort(),
    ).toEqual([
      'administer_residential',
      'archive_location',
      'cell_certificate_upload_create',
      'cell_certificate_upload_view',
      'certificate_change_request_create',
      'certificate_change_request_review',
      'certificate_change_request_withdraw',
      'certificate_view_management',
      'change_cell_capacity',
      'change_door_number',
      'change_local_name',
      'change_location_code',
      'change_non_residential_type',
      'change_sanitation',
      'change_signed_operational_capacity',
      'change_temporary_deactivation_details',
      'change_used_for',
      'convert_non_residential',
      'create_location',
      'deactivate',
      'deactivate:parent_location',
      'deactivate:permanent',
      'reactivate',
      'set_cell_type',
    ])
  })
})
