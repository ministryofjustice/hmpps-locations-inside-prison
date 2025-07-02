import { Location } from '../data/types/locationsApi'
import LocationStatusMap from '../data/types/locationsApi/locationStatusMap'

export default function locationStatusTagLabel(location: Location): string {
  return LocationStatusMap[location.status]?.label || location.status
}
