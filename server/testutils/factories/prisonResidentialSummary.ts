import { Factory } from 'fishery'

import { PrisonResidentialSummary } from '../../data/types/locationsApi/prisonResidentialSummary'
import LocationFactory from './location'

const PrisonResidentialSummaryFactory = Factory.define<PrisonResidentialSummary>(() => {
  return {
    prisonSummary: {
      workingCapacity: 100,
      signedOperationalCapacity: 140,
      maxCapacity: 200,
    },
    topLevelLocationType: 'Wings',
    subLocationName: 'Wings',
    subLocations: [
      LocationFactory.build({
        pathHierarchy: '1',
        id: '7e570000-0000-1000-8001-000000000001',
        locationType: 'WING',
        parentId: undefined,
        topLevelId: undefined,
        localName: undefined,
      }),
      LocationFactory.build({
        pathHierarchy: '2',
        id: '7e570000-0000-1000-8001-000000000002',
        locationType: 'WING',
        parentId: undefined,
        topLevelId: undefined,
        localName: undefined,
      }),
      LocationFactory.build({
        pathHierarchy: '3',
        id: '7e570000-0000-1000-8001-000000000003',
        locationType: 'WING',
        parentId: undefined,
        topLevelId: undefined,
        localName: undefined,
      }),
    ],
    locationHierarchy: [],
  }
})

export default PrisonResidentialSummaryFactory
