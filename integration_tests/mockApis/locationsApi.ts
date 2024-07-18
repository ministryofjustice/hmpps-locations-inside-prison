import { stubFor } from './wiremock'

import { Location, PrisonerLocation } from '../../server/data/locationsApiClient'
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

const stubLocationsConstantsConvertedCellType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/converted-cell-type',
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

const stubLocationsConstantsLocationType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/location-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        locationTypes: [
          { key: 'WING', description: 'Wing' },
          { key: 'LANDING', description: 'Landing' },
          { key: 'SPUR', description: 'Spur' },
          { key: 'CELL', description: 'Cell' },
          { key: 'ROOM', description: 'Room' },
        ],
      },
    },
  })

const stubLocationsConstantsNonResidentialUsageType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/non-residential-usage-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        nonResidentialUsageTypes: [{ key: 'TEST_TYPE', description: 'Test type' }],
      },
    },
  })

const stubLocationsConstantsResidentialAttributeType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/residential-attribute-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        residentialAttributeTypes: [{ key: 'TEST_TYPE', description: 'Test type' }],
      },
    },
  })

const stubLocationsConstantsResidentialHousingType = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/constants/residential-housing-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        residentialHousingTypes: [{ key: 'TEST_TYPE', description: 'Test type' }],
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
  prisonSummary = {
    workingCapacity: 8,
    signedOperationalCapacity: 10,
    maxCapacity: 9,
  },
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
        prisonSummary,
      },
    },
  })

const stubLocationsPrisonArchivedLocations = (locations: Location[]) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/prison/\\w+/archived',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: locations,
    },
  })

const stubLocationsPrisonInactiveCells = (locations: Location[]) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/prison/\\w+/inactive-cells',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: locations,
    },
  })

const stubLocationsPrisonInactiveCellsForLocation = (locations: Location[]) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/prison/\\w+/inactive-cells\\?parentLocationId=[\\w-]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: locations,
    },
  })

const stubGetLocation = (location: Location) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/[\\w-]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: location,
    },
  })

const stubGetPrisonersInLocation = (prisonerLocations: PrisonerLocation[]) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/prisoner-locations/id/[\\w-]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prisonerLocations,
    },
  })

const stubUpdateCapacity = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/capacity',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

export default {
  stubGetLocation,
  stubGetPrisonersInLocation,
  stubLocationsConstantsAccommodationType,
  stubLocationsConstantsConvertedCellType,
  stubLocationsConstantsDeactivatedReason,
  stubLocationsConstantsLocationType,
  stubLocationsConstantsNonResidentialUsageType,
  stubLocationsConstantsResidentialAttributeType,
  stubLocationsConstantsResidentialHousingType,
  stubLocationsConstantsSpecialistCellType,
  stubLocationsConstantsUsedForType,
  stubLocationsLocationsResidentialSummary,
  stubLocationsLocationsResidentialSummaryForLocation,
  stubLocationsPrisonArchivedLocations,
  stubLocationsPrisonInactiveCells,
  stubLocationsPrisonInactiveCellsForLocation,
  stubUpdateCapacity,
}
