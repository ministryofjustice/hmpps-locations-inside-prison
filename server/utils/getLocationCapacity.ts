import { Location } from '../data/types/locationsApi'

/**
 * Returns the current location capacities, taking into account any pending changes.
 *
 * @param {Location} location - The location object containing capacity and certification details.
 * @returns {{certifiedNormalAccommodation: number, maxCapacity: number, workingCapacity: number}} An object containing
 *    certifiedNormalAccommodation, maxCapacity, and workingCapacity.
 */
export default function getLocationCapacity(location: Location): {
  certifiedNormalAccommodation: number
  maxCapacity: number
  workingCapacity: number
} {
  let { workingCapacity, maxCapacity } = location.capacity
  let { certifiedNormalAccommodation } = location.certification

  const { pendingChanges } = location

  if (pendingChanges?.certifiedNormalAccommodation !== undefined) {
    certifiedNormalAccommodation = pendingChanges.certifiedNormalAccommodation
  }

  if (pendingChanges?.maxCapacity !== undefined) {
    maxCapacity = pendingChanges.maxCapacity
  }

  if (pendingChanges?.workingCapacity !== undefined) {
    workingCapacity = pendingChanges.workingCapacity
  }

  return { certifiedNormalAccommodation, maxCapacity, workingCapacity }
}
