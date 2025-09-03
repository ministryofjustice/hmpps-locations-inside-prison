import { stubFor } from './wiremock'

import {
  Location,
  LocationResidentialSummary,
  PrisonerLocation,
  PrisonResidentialSummary,
} from '../../server/data/types/locationsApi'
import LocationFactory from '../../server/testutils/factories/location'
import TypedStubber from './typedStubber'

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
          { key: 'TESTWING', description: 'Testwing' },
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
      attributes: { affectsCapacity: false },
    },
    {
      key: 'BIOHAZARD_DIRTY_PROTEST',
      description: 'Biohazard / dirty protest cell',
      additionalInformation: 'Previously known as a dirty protest cell',
      attributes: { affectsCapacity: true },
    },
    {
      key: 'CONSTANT_SUPERVISION',
      description: 'Constant Supervision Cell',
      attributes: { affectsCapacity: false },
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
  returnData: PrisonResidentialSummary = {
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
      urlPattern: '/locations-api/locations/residential-summary/\\w+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubLocationsResidentialSummaryForCreateWing = (
  returnData = {
    prisonSummary: {
      prisonName: 'string',
      workingCapacity: 0,
      signedOperationalCapacity: 0,
      maxCapacity: 0,
      numberOfCellLocations: 0,
    },
    topLevelLocationType: 'Wings',
    subLocationName: 'Wings',
    locationHierarchy: [
      {
        id: 'c73e8ad1-191b-42b8-bfce-2550cc858dab',
        prisonId: 'TST',
        code: '001',
        type: 'WING',
        localName: 'Wing A',
        pathHierarchy: 'ABC1',
        level: 1,
      },
    ],
    subLocations: [],
    parentLocation: {
      id: '2475f250-434a-4257-afe7-b911f1773a4d',
      prisonId: 'TST',
      code: '001',
      cellMark: 'A1',
      pathHierarchy: 'ABC1',
      locationType: 'WING',
      localName: 'Test W',
      wingStructure: ['WING'],
      comments: '',
      permanentlyInactive: false,
      permanentlyInactiveReason: '',
      capacity: {
        maxCapacity: 0,
        workingCapacity: 0,
      },
      pendingChanges: {
        maxCapacity: 0,
        certifiedNormalAccommodation: 0,
      },
      oldWorkingCapacity: 0,
      certification: {
        certified: false,
        certifiedNormalAccommodation: 0,
      },
      usage: [],
      accommodationTypes: [],
      specialistCellTypes: [],
      usedFor: [],
      status: 'DRAFT',
      locked: false,
      convertedCellType: '',
      otherConvertedCellType: 'string',
      inCellSanitation: true,
      deactivatedByParent: false,
      deactivatedDate: '',
      deactivatedReason: '',
      deactivationReasonDescription: '',
      deactivatedBy: 'string',
      proposedReactivationDate: '',
      planetFmReference: '',
      topLevelId: 'c73e8ad1-191b-42b8-bfce-2550cc858dab',
      level: 1,
      leafLevel: false,
      parentId: 'c73e8ad1-191b-42b8-bfce-2550cc858dab',
      parentLocation: 'string',
      inactiveCells: 0,
      numberOfCellLocations: 0,
      changeHistory: [],
      transactionHistory: [],
      lastModifiedBy: 'string',
      lastModifiedDate: '',
      key: '',
      isResidential: true,
    },
  },
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/locations/residential-summary/TST\\?parentLocationId=.*',
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
  wingStructure = ['WING', 'LANDING', 'CELL'],
}: Partial<LocationResidentialSummary> = {}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/locations-api/locations/residential-summary/${parentLocation.prisonId}\\?parentLocationId=${parentLocation.id}`,
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
        wingStructure,
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
      urlPattern: `/locations-api/locations/${location.id}\\?includeHistory=(false|true)`,
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

const stubPrisonerLocations = (prisonerLocations: PrisonerLocation[]) =>
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
      jsonBody: prisonerLocations,
    },
  })

const stubPrisonConfiguration = (
  returnData = {
    prisonId: 'TST',
    resiLocationServiceActive: 'INACTIVE',
    certificationApprovalRequired: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
  },
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/prison-configuration/[\\w-]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubPrisonConfigurationResiActive = (
  returnData = {
    prisonId: 'TST',
    resiLocationServiceActive: 'ACTIVE',
    certificationApprovalRequired: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
  },
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/prison-configuration/[\\w-]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubPrisonConfigurationCertApproval = (
  returnData = {
    prisonId: 'TST',
    resiLocationServiceActive: 'INACTIVE',
    certificationApprovalRequired: 'ACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
  },
) =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/prison-configuration/\\w+/certification-approval-required/ACTIVE',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubPrisonConfigurationActivateResi = (
  returnData = {
    prisonId: 'TST',
    resiLocationServiceActive: 'ACTIVE',
    certificationApprovalRequired: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
  },
) =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/prison-configuration/\\w+/resi-service/ACTIVE',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubPrisonConfigurationDeactivateResi = (
  returnData = {
    prisonId: 'TST',
    resiLocationServiceActive: 'ACTIVE',
    certificationApprovalRequired: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
  },
) =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/prison-configuration/\\w+/resi-service/INACTIVE',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
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

const stubLocationsResidentialHierarchy = ({ prisonId, residentialHierarchy }) =>
  stubFor({
    request: {
      method: 'GET',
      url: `/locations-api/locations/prison/${prisonId}/residential-hierarchy`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: residentialHierarchy,
    },
  })

const stubLocationsResidentialHierarchyWithDrafts = ({
  prisonId,
  locationHierarchy,
  returnData,
}: {
  prisonId: string
  locationHierarchy: string
  returnData: object[]
}) =>
  stubFor({
    request: {
      method: 'GET',
      url: `/locations-api/locations/prison/${prisonId}/residential-hierarchy/${locationHierarchy}?includeInactive=true`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubLocationsPrisonLocalName = ({
  exists,
  name = '[^?]+',
  prisonId = '\\w+',
  locationId,
}: {
  exists: boolean
  name?: string
  prisonId?: string
  locationId?: string
}) => {
  const response = exists
    ? {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
          exists: true,
        }),
      }
    : {
        status: 404,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      }

  return stubFor({
    request: {
      method: 'GET',
      urlPattern: `/locations-api/locations/${prisonId}/local-name/${name.replace(/ /g, '%20')}${locationId ? `\\?parentLocationId=${locationId}` : '(\\?.+)?'}`,
    },
    response,
  })
}

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

const stubUpdateLocationCode = () =>
  stubFor({
    request: {
      method: 'PATCH',
      urlPattern: '/locations-api/locations/residential/[\\w-]+',
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

const stubLocationsConvertCellToNonResCellOccupied = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/convert-cell-to-non-res-cell',
    },
    response: {
      status: 409,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 409,
        userMessage: 'Deactivation Exception: 1 locations contain 1 prisoners',
        developerMessage: '1 locations contain 1 prisoners',
        errorCode: 109,
      },
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

const stubLocationsDeactivatePermanent = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/deactivate/permanent',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsDeactivatePermanentOccupied = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/deactivate/permanent',
    },
    response: {
      status: 409,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 409,
        userMessage: 'Deactivation Exception: 1 locations contain 1 prisoners',
        developerMessage: '1 locations contain 1 prisoners',
        errorCode: 109,
      },
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

const stubLocationsDeactivateTemporaryOccupied = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/deactivate/temporary',
    },
    response: {
      status: 409,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 409,
        userMessage: 'Deactivation Exception: 1 locations contain 1 prisoners',
        developerMessage: '1 locations contain 1 prisoners',
        errorCode: 109,
      },
    },
  })

const stubLocationsChangeTemporaryDeactivationDetails = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/update/temporary-deactivation',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsUpdateNonResCell = () =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: '/locations-api/locations/[\\w-]+/update-non-res-cell', // path: '/locations/:locationId/update-non-res-cell',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const stubLocationsHealthPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locations-api/health/ping',
    },
    response: {
      status: 200,
    },
  })

const stubGetPrisonConfiguration = ({
  prisonId,
  certificationActive,
}: {
  prisonId: string
  certificationActive: string
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/locations-api/prison-configuration/${prisonId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        prisonId,
        resiLocationServiceActive: 'INACTIVE',
        includeSegregationInRollCount: 'INACTIVE',
        certificationApprovalRequired: certificationActive,
      },
    },
  })

const stubLocationsCreateWing = (location: Location) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/locations-api/locations/create-wing',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: location,
    },
  })

const stubLocationsCreateCells = (location: Location) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/locations-api/locations/create-cells',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: location,
    },
  })

const stubLocationsDeleteLocation = () =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: '/locations-api/locations/[\\w-]+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })

const allStubs = {
  stubLocations,
  stubLocationsBulkReactivate,
  stubLocationsResidentialHierarchy,
  stubLocationsResidentialHierarchyWithDrafts,
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
  stubLocationsConvertCellToNonResCellOccupied,
  stubLocationsConvertToCell,
  stubLocationsCreateCells,
  stubLocationsCreateWing,
  stubLocationsDeactivatePermanent,
  stubLocationsDeactivatePermanentOccupied,
  stubLocationsDeactivateTemporary,
  stubLocationsDeactivateTemporaryOccupied,
  stubLocationsHealthPing,
  stubLocationsLocationsResidentialSummary,
  stubLocationsLocationsResidentialSummaryForLocation,
  stubLocationsPrisonArchivedLocations,
  stubLocationsPrisonInactiveCells,
  stubLocationsPrisonInactiveCellsForLocation,
  stubLocationsPrisonLocalName,
  stubGetPrisonConfiguration,
  stubPrisonConfiguration,
  stubPrisonConfigurationCertApproval,
  stubPrisonConfigurationActivateResi,
  stubPrisonConfigurationDeactivateResi,
  stubPrisonConfigurationResiActive,
  stubPrisonerLocations,
  stubPrisonerLocationsId,
  stubSignedOperationalCapacityGet,
  stubSignedOperationalCapacityGetNotFound,
  stubSignedOperationalCapacityUpdate,
  stubUpdateCapacity,
  stubUpdateLocalName,
  stubUpdateSpecialistCellTypes,
  stubUpdateLocationCode,
  stubUpdateLocationsConstantsUsedForType,
  stubLocationsChangeTemporaryDeactivationDetails,
  stubLocationsUpdateNonResCell,
  stubLocationsResidentialSummaryForCreateWing,
  stubLocationsDeleteLocation,
}

const LocationsApiStubber = new TypedStubber<typeof allStubs>(allStubs)
export default LocationsApiStubber
