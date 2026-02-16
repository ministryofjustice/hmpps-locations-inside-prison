import getLocationAttributesIncludePending from './getLocationAttributesIncludePending'
import LocationFactory from '../testutils/factories/location'
import buildDecoratedLocation from '../testutils/buildDecoratedLocation'

describe('getLocationAttributesIncludePending', () => {
  it('returns base attributes for a non-draft location', () => {
    const baseLocation = LocationFactory.build({
      status: 'ACTIVE',
      pendingChanges: {
        certifiedNormalAccommodation: 5,
        maxCapacity: 12,
        workingCapacity: 9,
        cellMark: 'B',
        inCellSanitation: false,
      },
      capacity: {
        maxCapacity: 10,
        workingCapacity: 8,
        certifiedNormalAccommodation: 7,
      },
      cellMark: 'A',
      inCellSanitation: true,
    })
    const result = getLocationAttributesIncludePending(baseLocation)
    expect(result).toEqual({
      certifiedNormalAccommodation: 7,
      maxCapacity: 10,
      workingCapacity: 8,
      cellMark: 'A',
      inCellSanitation: true,
    })
  })

  it('returns pending changes for a DRAFT location', () => {
    const draftLocation = LocationFactory.build({
      status: 'DRAFT',
      pendingChanges: {
        certifiedNormalAccommodation: 5,
        maxCapacity: 12,
        workingCapacity: 9,
        cellMark: 'B',
        inCellSanitation: false,
      },
      capacity: {
        maxCapacity: 10,
        workingCapacity: 8,
        certifiedNormalAccommodation: 7,
      },
      cellMark: 'A',
      inCellSanitation: true,
    })
    const result = getLocationAttributesIncludePending(draftLocation)
    expect(result).toEqual({
      certifiedNormalAccommodation: 5,
      maxCapacity: 12,
      workingCapacity: 9,
      cellMark: 'B',
      inCellSanitation: false,
    })
  })

  it('handles partial pending changes for a DRAFT location', () => {
    const draftLocation = LocationFactory.build({
      status: 'DRAFT',
      pendingChanges: {
        maxCapacity: 15,
      },
      capacity: {
        maxCapacity: 10,
        workingCapacity: 8,
        certifiedNormalAccommodation: 7,
      },
      cellMark: 'A',
      inCellSanitation: true,
    })
    const result = getLocationAttributesIncludePending(draftLocation)
    expect(result).toEqual({
      certifiedNormalAccommodation: 7,
      maxCapacity: 15,
      workingCapacity: 8,
      cellMark: 'A',
      inCellSanitation: true,
    })
  })

  it('handles missing pendingChanges for a DRAFT location', () => {
    const draftLocation = LocationFactory.build({
      status: 'DRAFT',
      pendingChanges: undefined,
      capacity: {
        maxCapacity: 10,
        workingCapacity: 8,
        certifiedNormalAccommodation: 7,
      },
      cellMark: 'A',
      inCellSanitation: true,
    })
    const result = getLocationAttributesIncludePending(draftLocation)
    expect(result).toEqual({
      certifiedNormalAccommodation: 7,
      maxCapacity: 10,
      workingCapacity: 8,
      cellMark: 'A',
      inCellSanitation: true,
    })
  })

  it('works with DecoratedLocation', () => {
    const decorated = buildDecoratedLocation({
      status: 'DRAFT',
      pendingChanges: {
        workingCapacity: 99,
      },
      capacity: {
        maxCapacity: 10,
        workingCapacity: 8,
        certifiedNormalAccommodation: 7,
      },
      cellMark: 'A',
      inCellSanitation: true,
    })
    const result = getLocationAttributesIncludePending(decorated)
    expect(result).toEqual({
      certifiedNormalAccommodation: 7,
      maxCapacity: 10,
      workingCapacity: 99,
      cellMark: 'A',
      inCellSanitation: true,
    })
  })
})
