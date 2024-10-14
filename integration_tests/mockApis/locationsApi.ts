import { stubFor } from './wiremock'

import { Location, PrisonerLocation } from '../../server/data/types/locationsApi'
import LocationFactory from '../../server/testutils/factories/location'

const stubLocationsConstantsAccommodationType = (
  accommodationTypes = [
    {
      key: 'CARE_AND_SEPARATION',
      description: 'Care and separation',
    },
    {
      key: 'HEALTHCARE_INPATIENTS',
      description: 'Healthcare inpatients',
    },
    {
      key: 'NORMAL_ACCOMMODATION',
      description: 'Normal accommodation',
    },
    {
      key: 'OTHER_NON_RESIDENTIAL',
      description: 'Other',
    },
  ],
) =>
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
        accommodationTypes,
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
        convertedCellTypes: [
          {
            key: 'KITCHEN_SERVERY',
            description: 'Kitchen / Servery',
          },
          {
            key: 'OFFICE',
            description: 'Office',
          },
          {
            key: 'OTHER',
            description: 'Other',
          },
        ],
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
        deactivatedReasons: [
          { key: 'TEST1', description: 'Test type 1' },
          { key: 'OTHER', description: 'Other' },
          { key: 'TEST2', description: 'Test type 2' },
        ],
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

const stubLocationsConstantsSpecialistCellType = (
  specialistCellTypes = [
    {
      key: 'ACCESSIBLE_CELL',
      description: 'Accessible cell',
      additionalInformation: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
    },
    {
      key: 'BIOHAZARD_DIRTY_PROTEST',
      description: 'Biohazard / dirty protest cell',
      additionalInformation: 'Previously known as a dirty protest cell',
    },
    {
      key: 'CONSTANT_SUPERVISION',
      description: 'Constant Supervision Cell',
    },
  ],
) =>
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
        specialistCellTypes,
      },
    },
  })

const stubLocationsConstantsUsedForType = (
  usedForTypes = [
    {
      key: 'CLOSE_SUPERVISION_CENTRE',
      description: 'Close Supervision Centre (CSC)',
    },
    {
      key: 'SUB_MISUSE_DRUG_RECOVERY',
      description: 'Drug recovery / Incentivised substance free living (ISFL)',
    },
    {
      key: 'FIRST_NIGHT_CENTRE',
      description: 'First night centre / Induction',
    },
    {
      key: 'TEST_TYPE',
      description: 'Test type',
    },
    {
      key: 'STANDARD_ACCOMMODATION',
      description: 'Standard accommodation',
    },
  ],
) =>
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
        usedForTypes,
      },
    },
  })

const stubLocationsConstantsUsedForTypeForPrison = (
  prisonId = 'TST',
  usedForTypes = [
    {
      key: 'CLOSE_SUPERVISION_CENTRE',
      description: 'Close Supervision Centre (CSC)',
    },
    {
      key: 'SUB_MISUSE_DRUG_RECOVERY',
      description: 'Drug recovery / Incentivised substance free living (ISFL)',
    },
    {
      key: 'FIRST_NIGHT_CENTRE',
      description: 'First night centre / Induction',
    },
  ],
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/locations-api/constants/used-for-type/${prisonId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        usedForTypes,
      },
    },
  })

const stubLocationsLocationsResidentialSummary = (
  returnData = {
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
) =>
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
      jsonBody: returnData,
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

const stubSignedOperationalCapacityGet = (
  returnData = {
    signedOperationCapacity: 200,
    prisonId: 'TST',
    whenUpdated: '2024-07-05T10:35:17',
    updatedBy: 'USERNAME',
  },
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/signed-op-cap/\\w+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubSignedOperationalCapacityGetNotFound = (
  returnData = {
    status: 404,
    userMessage: 'No location found for ID `de91dfa7-821f-4552-a427-bf2f32eafeb0',
    developerMessage: 'blah',
    errorCode: 101,
    moreInfo: 'blahblah',
  },
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/signed-op-cap/\\w+',
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubSignedOperationalCapacityUpdate = () =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/locations-api/signed-op-cap/',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
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

const stubLocations = (location: Location) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/[\\w-]+\\?includeHistory=(false|true)',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: location,
    },
  })

const stubPrisonerLocationsId = (prisonerLocations: PrisonerLocation[]) =>
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

const stubLocationsCheckLocalNameDoesntExist = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/[\\w-%]+/local-name/[\\w-%]+',
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubLocationsCheckLocalNameExists = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/[\\w-%]+/local-name/[\\w-%]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        exists: true,
      }),
    },
  })

const stubUpdateLocalName = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-%]+/change-local-name',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsBulkReactivate = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/bulk/reactivate',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubUpdateSpecialistCellTypes = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/specialist-cell-types',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubUpdateLocationsConstantsUsedForType = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/used-for-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsConvertCellToNonResCell = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/convert-cell-to-non-res-cell',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsConvertToCell = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/convert-to-cell',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsDeactivateTemporary = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/deactivate/temporary',
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
  stubLocations,
  stubLocationsBulkReactivate,
  stubLocationsCheckLocalNameDoesntExist,
  stubLocationsCheckLocalNameExists,
  stubLocationsConstantsAccommodationType,
  stubLocationsConstantsConvertedCellType,
  stubLocationsConstantsDeactivatedReason,
  stubLocationsConstantsLocationType,
  stubLocationsConstantsNonResidentialUsageType,
  stubLocationsConstantsResidentialAttributeType,
  stubLocationsConstantsResidentialHousingType,
  stubLocationsConstantsSpecialistCellType,
  stubLocationsConstantsUsedForType,
  stubLocationsConstantsUsedForTypeForPrison,
  stubLocationsConvertCellToNonResCell,
  stubLocationsConvertToCell,
  stubLocationsDeactivateTemporary,
  stubLocationsLocationsResidentialSummary,
  stubLocationsLocationsResidentialSummaryForLocation,
  stubLocationsPrisonArchivedLocations,
  stubLocationsPrisonInactiveCells,
  stubLocationsPrisonInactiveCellsForLocation,
  stubPrisonerLocationsId,
  stubSignedOperationalCapacityGet,
  stubSignedOperationalCapacityGetNotFound,
  stubSignedOperationalCapacityUpdate,
  stubUpdateCapacity,
  stubUpdateLocalName,
  stubUpdateSpecialistCellTypes,
  stubUpdateLocationsConstantsUsedForType,
}
