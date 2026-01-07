import { DeepPartialObject } from 'fishery'
import { Location, LocationSummary } from '../data/types/locationsApi'

const buildLocationHierarchy = (locations: DeepPartialObject<Location>[]): LocationSummary[] => {
  return locations.map(({ id, prisonId, code, locationType: type, pathHierarchy, level }) => ({
    id,
    prisonId,
    code,
    type,
    pathHierarchy,
    level,
  }))
}

export default buildLocationHierarchy
