import { stubFor } from './wiremock'

import LocationFactory from '../../server/testutils/factories/location'

const stubLocationsConstantsAccommodationType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/accommodation-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        accommodationTypes: [{ key: 'TEST_TYPE', description: 'Test type' }],
      },
    },
  })

const stubLocationsConstantsDeactivatedReason = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/deactivated-reason',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        deactivatedReasons: [{ key: 'TEST_TYPE', description: 'Test type' }],
      },
    },
  })

const stubLocationsConstantsSpecialistCellType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/specialist-cell-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        specialistCellTypes: [{ key: 'TEST_TYPE', description: 'Test type' }],
      },
    },
  })

const stubLocationsConstantsUsedForType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/used-for-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        usedForTypes: [{ key: 'TEST_TYPE', description: 'Test type' }],
      },
    },
  })

const stubLocationsLocationsResidentialSummary = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/residential-summary/\\w+(\\?parentLocationId=[\\w-]+)?',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        prisonSummary: {
          workingCapacity: 8,
          signedOperationalCapacity: 10,
          maxCapacity: 9,
        },
        subLocationName: 'TestWings',
        subLocations: [
          LocationFactory.build(),
          LocationFactory.build({
            id: '7e570000-0000-0000-0000-000000000002',
            pathHierarchy: 'A-1-002',
            localName: undefined,
            code: '002',
            inactiveCells: 1,
            capacity: { maxCapacity: 3, workingCapacity: 1 },
            status: 'INACTIVE',
          }),
        ],
        topLevelLocationType: 'Wings',
        locationHierarchy: [],
      },
    },
  })

const stubLocationsLocationsResidentialSummaryForLocation = ({
  parentLocation = LocationFactory.build(),
  subLocationName = 'Landings',
  subLocations = [],
  topLevelLocationType = 'Wings',
  locationHierarchy = [
    {
      id: 'id1',
      prisonId: 'TST',
      code: '1',
      type: 'WING',
      pathHierarchy: '1',
      level: 1,
    },
  ],
} = {}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/residential-summary/\\w+(\\?parentLocationId=[\\w-]+)?',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        parentLocation,
        subLocationName,
        subLocations,
        topLevelLocationType,
        locationHierarchy,
      },
    },
  })

export default {
  stubLocationsConstantsAccommodationType,
  stubLocationsConstantsDeactivatedReason,
  stubLocationsConstantsSpecialistCellType,
  stubLocationsConstantsUsedForType,
  stubLocationsLocationsResidentialSummary,
  stubLocationsLocationsResidentialSummaryForLocation,
}
