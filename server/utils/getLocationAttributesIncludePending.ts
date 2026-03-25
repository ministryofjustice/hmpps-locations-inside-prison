import { Location } from '../data/types/locationsApi'
import { DecoratedLocation } from '../decorators/decoratedLocation'

/**
 * Returns the current location's attributes, including any pending changes for draft locations.
 *
 * @param {Location} location - The location.
 * @returns {{certifiedNormalAccommodation: number, maxCapacity: number, workingCapacity: number, cellMark: string,
    inCellSanitation: boolean}} An object containing certifiedNormalAccommodation, maxCapacity, workingCapacity,
    cellMark and inCellSanitation.
 */
export default function getLocationAttributesIncludePending(
  location: Location | DecoratedLocation,
): Location['pendingChanges'] {
  let { cellMark, inCellSanitation } = location
  let { certifiedNormalAccommodation, maxCapacity, workingCapacity } = location.capacity

  const { pendingChanges } = location

  if (location.status.includes('DRAFT')) {
    if (pendingChanges?.certifiedNormalAccommodation !== undefined) {
      certifiedNormalAccommodation = pendingChanges.certifiedNormalAccommodation
    }

    if (pendingChanges?.maxCapacity !== undefined) {
      maxCapacity = pendingChanges.maxCapacity
    }

    if (pendingChanges?.workingCapacity !== undefined) {
      workingCapacity = pendingChanges.workingCapacity
    }

    if (pendingChanges?.cellMark !== undefined) {
      cellMark = pendingChanges.cellMark
    }

    if (pendingChanges?.inCellSanitation !== undefined) {
      inCellSanitation = pendingChanges.inCellSanitation
    }
  }

  return { certifiedNormalAccommodation, maxCapacity, workingCapacity, cellMark, inCellSanitation }
}
