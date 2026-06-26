import approvalTypeDescription from './approvalTypeDescription'
import { LocationsApiConstant } from '../data/types/locationsApi/constant'
import CertificationApprovalRequestFactory from '../testutils/factories/certificationApprovalRequest'

const mockConstants = {
  locationTypes: [
    { key: 'CELL', description: 'Cell' },
    { key: 'WING', description: 'Wing' },
    { key: 'LANDING', description: 'Landing' },
  ] as LocationsApiConstant[],
  approvalTypes: [
    { key: 'DRAFT', description: 'Add new locations to certificate' },
    { key: 'SIGNED_OP_CAP', description: 'Change signed operational capacity' },
    { key: 'CELL_MARK', description: 'Change cell door number' },
    { key: 'CAPACITY_CHANGE', description: 'Cell capacity' },
    { key: 'PRISON_BASELINE', description: 'Initial certificate generation' },
    { key: 'PERMANENT_DEACTIVATION', description: 'Archived' },
    { key: 'CELL_CERTIFICATE_UPLOAD', description: 'Initial cell certificate import' },
  ] as LocationsApiConstant[],
} as any

const baseLocation = {
  locationType: 'CELL',
} as any

describe('approvalTypeDescription', () => {
  it('returns correct description for DRAFT', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'DRAFT' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Add new locations to certificate')
  })

  it('returns correct description for DEACTIVATION', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'DEACTIVATION' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Cell deactivation (decrease certified working capacity)')
  })

  it('returns correct description for SIGNED_OP_CAP', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'SIGNED_OP_CAP' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Change signed operational capacity')
  })

  it('returns correct description for CELL_MARK', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'CELL_MARK' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Change cell door number')
  })

  it('returns correct description for CAPACITY_CHANGE', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'CAPACITY_CHANGE' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Cell capacity')
  })

  it('returns correct description for SPECIALIST_CELL_TYPE when setting a type', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({
          approvalType: 'SPECIALIST_CELL_TYPE',
          specialistCellTypes: ['DRY'],
          locations: [
            {
              ...baseLocation,
              specialistCellTypes: ['DRY'],
            },
          ],
        }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Set special cell type')
  })

  it('returns correct description for SPECIALIST_CELL_TYPE when removing the type', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({
          approvalType: 'SPECIALIST_CELL_TYPE',
          specialistCellTypes: [],
          locations: [
            {
              ...baseLocation,
              specialistCellTypes: [],
            },
          ],
        }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Remove special cell type')
  })

  it('returns correct description for PRISON_BASELINE', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'PRISON_BASELINE' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Initial certificate generation')
  })

  it('returns correct description for PERMANENT_DEACTIVATION', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'PERMANENT_DEACTIVATION' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Archived')
  })

  it('returns correct description for CELL_CERTIFICATE_UPLOAD', () => {
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'CELL_CERTIFICATE_UPLOAD' }),
        mockConstants,
        baseLocation,
      ),
    ).toBe('Initial cell certificate import')
  })

  it('returns approvalType for unknown type', () => {
    expect(approvalTypeDescription({ approvalType: 'UNKNOWN' } as any, mockConstants, baseLocation)).toBe('UNKNOWN')
  })

  it('falls back to the raw approvalType when constants are not loaded', () => {
    expect(approvalTypeDescription({ approvalType: 'CAPACITY_CHANGE' } as any, {} as any, baseLocation)).toBe(
      'CAPACITY_CHANGE',
    )
  })

  it('handles missing locationType in constants gracefully', () => {
    const location = { locationType: 'LANDING2' } as any
    expect(
      approvalTypeDescription(
        CertificationApprovalRequestFactory.build({ approvalType: 'DEACTIVATION' }),
        mockConstants,
        location,
      ),
    ).toBe('Landing2 deactivation (decrease certified working capacity)')
  })
})
