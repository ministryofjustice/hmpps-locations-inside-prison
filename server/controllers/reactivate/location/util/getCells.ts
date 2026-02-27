import { DecoratedLocationTree, LocationTree } from '../../parent/middleware/populateLocationTree'
import { Location } from '../../../../data/types/locationsApi'

export default function getCells(trees: (DecoratedLocationTree | LocationTree)[]): Location[] {
  const cells: Location[] = []

  trees.forEach(tree => {
    const location = 'decoratedLocation' in tree ? tree.decoratedLocation.raw : tree.location
    if (location.locationType === 'CELL') {
      cells.push(location)
    }

    cells.push(...getCells('decoratedSubLocations' in tree ? tree.decoratedSubLocations : tree.subLocations))
  })

  return cells
}
