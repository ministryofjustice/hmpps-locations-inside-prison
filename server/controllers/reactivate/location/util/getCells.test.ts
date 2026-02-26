import getCells from './getCells'
import { Location } from '../../../../data/types/locationsApi'
import { DecoratedLocationTree, LocationTree } from '../../parent/middleware/populateLocationTree'
import buildDecoratedLocation from '../../../../testutils/buildDecoratedLocation'
import LocationFactory from '../../../../testutils/factories/location'

describe('getCells', () => {
  const cell = LocationFactory.build({ id: 'cell1', locationType: 'CELL' })
  const wing: Location = LocationFactory.build({ id: 'wing1', locationType: 'WING' })
  const cell2: Location = LocationFactory.build({ id: 'cell2', locationType: 'CELL' })

  it('returns empty array for empty input', () => {
    expect(getCells([])).toEqual([])
  })

  it('returns single cell from simple tree', () => {
    const tree: LocationTree[] = [{ location: cell, subLocations: [] }]
    expect(getCells(tree)).toEqual([cell])
  })

  it('returns no cells if none present', () => {
    const tree: LocationTree[] = [{ location: wing, subLocations: [] }]
    expect(getCells(tree)).toEqual([])
  })

  it('returns all cells from nested tree', () => {
    const tree: LocationTree[] = [
      {
        location: wing,
        subLocations: [
          { location: cell, subLocations: [] },
          { location: cell2, subLocations: [] },
        ],
      },
    ]
    expect(getCells(tree)).toEqual([cell, cell2])
  })

  it('handles DecoratedLocationTree', () => {
    const decoratedTree: DecoratedLocationTree[] = [
      {
        decoratedLocation: buildDecoratedLocation(cell),
        decoratedSubLocations: [{ decoratedLocation: buildDecoratedLocation(cell2), decoratedSubLocations: [] }],
      },
    ]
    expect(getCells(decoratedTree as any)).toEqual([cell, cell2])
  })
})
