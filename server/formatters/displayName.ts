import { Location } from '../data/types/locationsApi'
import LocationsService from '../services/locationsService'

export default async function displayName({
  location,
  locationsService,
  systemToken,
}: {
  location: Location
  locationsService: LocationsService
  systemToken: string
}) {
  const locationType = await locationsService.getLocationType(systemToken, location.locationType)

  return location.localName || `${locationType.toLowerCase()} ${location.pathHierarchy}`
}
