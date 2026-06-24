import approvalTypeDescription from './approvalTypeDescription'
import { LocationsApiConstant } from '../data/types/locationsApi/constant'
import CertificationApprovalRequestFactory from '../testutils/factories/certificationApprovalRequest'

const mockConstants = {
  locationTypes: [
    { key: 'CELL', description: 'Cell' },
    { key: 'WING', description: 'Wing' },
    { key: 'LANDING', description: 'Landing' },
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

  it('returns approvalType for unknown type', () => {
    expect(approvalTypeDescription({ approvalType: 'UNKNOWN' } as any, mockConstants, baseLocation)).toBe('UNKNOWN')
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
