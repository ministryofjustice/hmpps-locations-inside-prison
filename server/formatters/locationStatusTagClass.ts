import { Location } from '../data/types/locationsApi'
import LocationStatusMap from '../data/types/locationsApi/locationStatusMap'

export default function locationStatusTagClass(location: Location): string {
  const { status } = location
  const mapping = LocationStatusMap[status]
  return mapping?.tagColour ? `govuk-tag--${mapping.tagColour}` : ''
}
