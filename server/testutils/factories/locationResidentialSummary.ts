import { Factory } from 'fishery'

import LocationFactory from './location'
import { LocationResidentialSummary } from '../../data/types/locationsApi/locationResidentialSummary'

const LocationResidentialSummaryFactory = Factory.define<LocationResidentialSummary>(() => {
  return {
    parentLocation: LocationFactory.build({
      pathHierarchy: '1',
      id: '7e570000-0000-1000-8001-000000000001',
      locationType: 'WING',
      parentId: undefined,
      topLevelId: undefined,
      localName: undefined,
    }),
    topLevelLocationType: 'Wings',
    subLocationName: 'Landings',
    subLocations: [
      LocationFactory.build({
        pathHierarchy: 'A',
        id: '7e570000-0000-1000-8002-000000000001',
        locationType: 'LANDING',
        parentId: undefined,
        topLevelId: undefined,
        localName: undefined,
      }),
      LocationFactory.build({
        pathHierarchy: 'B',
        id: '7e570000-0000-1000-8002-000000000002',
        locationType: 'LANDING',
        parentId: undefined,
        topLevelId: undefined,
        localName: undefined,
      }),
      LocationFactory.build({
        pathHierarchy: 'C',
        id: '7e570000-0000-1000-8002-000000000003',
        locationType: 'LANDING',
        parentId: undefined,
        topLevelId: undefined,
        localName: undefined,
      }),
    ],
    locationHierarchy: [],
    wingStructure: [],
  }
})

export default LocationResidentialSummaryFactory
