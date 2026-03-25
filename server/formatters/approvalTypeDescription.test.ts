import approvalTypeDescription from './approvalTypeDescription'
import { LocationsApiConstant } from '../data/types/locationsApi/constant'

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
    expect(approvalTypeDescription('DRAFT', mockConstants, baseLocation)).toBe('Add new locations to certificate')
  })

  it('returns correct description for DEACTIVATION', () => {
    expect(approvalTypeDescription('DEACTIVATION', mockConstants, baseLocation)).toBe(
      'Cell deactivation (decrease certified working capacity)',
    )
  })

  it('returns correct description for SIGNED_OP_CAP', () => {
    expect(approvalTypeDescription('SIGNED_OP_CAP', mockConstants, baseLocation)).toBe(
      'Change signed operational capacity',
    )
  })

  it('returns correct description for CELL_MARK', () => {
    expect(approvalTypeDescription('CELL_MARK', mockConstants, baseLocation)).toBe('Change cell door number')
  })

  it('returns approvalType for unknown type', () => {
    expect(approvalTypeDescription('UNKNOWN', mockConstants, baseLocation)).toBe('UNKNOWN')
  })

  it('handles missing locationType in constants gracefully', () => {
    const location = { locationType: 'LANDING2' } as any
    expect(approvalTypeDescription('DEACTIVATION', mockConstants, location)).toBe(
      'Landing2 deactivation (decrease certified working capacity)',
    )
  })
})
