import config from '../config'
import BaseApiClient from './baseApiClient'

export interface Location {
  id: string
  prisonId: string
  code: string
  pathHierarchy: string
  locationType:
    | 'WING'
    | 'SPUR'
    | 'LANDING'
    | 'CELL'
    | 'ROOM'
    | 'AREA'
    | 'HOLDING_AREA'
    | 'MOVEMENT_AREA'
    | 'RESIDENTIAL_UNIT'
    | 'EXTERNAL_GROUNDS'
    | 'HOLDING_CELL'
    | 'MEDICAL'
    | 'GROUP'
    | 'OFFICE'
    | 'ADMINISTRATION_AREA'
    | 'BOOTH'
    | 'BOX'
    | 'RETURN_TO_UNIT'
    | 'CLASSROOM'
    | 'TRAINING_AREA'
    | 'TRAINING_ROOM'
    | 'EXERCISE_AREA'
    | 'SPORTS'
    | 'WORKSHOP'
    | 'INSIDE_PARTY'
    | 'OUTSIDE_PARTY'
    | 'FAITH_AREA'
    | 'ADJUDICATION_ROOM'
    | 'APPOINTMENTS'
    | 'VISITS'
    | 'VIDEO_LINK'
    | 'ASSOCIATION'
    | 'INTERNAL_GROUNDS'
    | 'INTERVIEW'
    | 'LOCATION'
    | 'POSITION'
    | 'SHELF'
    | 'STORE'
    | 'TABLE'
  residentialHousingType: string
  localName: string
  comments: string
  permanentlyInactive: boolean
  permanentlyInactiveReason: string
  capacity: {
    maxCapacity: number
    workingCapacity: number
  }
  certification: {
    certified: boolean
    capacityOfCertifiedCell: number
  }
  attributes: string[]
  usage: {
    usageType: string
    capacity: number
    sequence: number
  }[]
  accommodationTypes: string[]
  specialistCellTypes: string[]
  usedFor: string[]
  orderWithinParentLocation: number
  status: 'ACTIVE' | 'INACTIVE' | 'NON_RESIDENTIAL'
  convertedCellType: string
  otherConvertedCellType: string
  active: boolean
  deactivatedByParent: boolean
  deactivatedDate: string
  deactivatedReason: string
  deactivatedBy: string
  proposedReactivationDate?: string
  topLevelId: string
  parentId: string
  parentLocation: string
  inactiveCells: number
  childLocations: string[]
  changeHistory: {
    attribute: string
    oldValue: string
    newValue: string
    amendedBy: string
    amendedDate: string
  }[]
  lastModifiedBy: string
  lastModifiedDate: string
  key: string
  isResidential: boolean
  leafLevel: boolean
  level: number
  sortName: string
  planetFmReference: string
}

export interface LocationSummary {
  id: string
  prisonId: string
  code: string
  type: string
  localName?: string
  pathHierarchy: string
  level: number
}

export interface ResidentialSummary {
  prisonSummary?: {
    workingCapacity: number
    signedOperationalCapacity: number
    maxCapacity: number
  }
  parentLocation?: Location
  topLevelLocationType: string
  subLocationName: string
  subLocations: Location[]
  locationHierarchy: LocationSummary[]
}

export interface PrisonerLocation {
  cellLocation: string
  prisoners: {
    prisonerNumber: string
    prisonId: string
    prisonName: string
    cellLocation: string
    firstName: string
    lastName: string
    gender: string
    csra: string
    category: string
    alerts: {
      alertType: string
      alertCode: string
      active: boolean
      expired: boolean
    }[]
  }[]
}

export interface SignedOperationalCapacity {
  signedOperationCapacity: number
  prisonId: string
  whenUpdated: string
  updatedBy: string
}

export default class LocationsApiClient extends BaseApiClient {
  protected static config() {
    return config.apis.locationsApi
  }

  constants = {
    getAccommodationTypes: this.apiCall<{ accommodationTypes: { key: string; description: string }[] }, null>({
      path: '/constants/accommodation-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getConvertedCellTypes: this.apiCall<{ convertedCellTypes: { key: string; description: string }[] }, null>({
      path: '/constants/converted-cell-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getDeactivatedReasons: this.apiCall<{ deactivatedReasons: { key: string; description: string }[] }, null>({
      path: '/constants/deactivated-reason',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getLocationTypes: this.apiCall<{ locationTypes: { key: string; description: string }[] }, null>({
      path: '/constants/location-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getNonResidentialUsageTypes: this.apiCall<
      { nonResidentialUsageTypes: { key: string; description: string }[] },
      null
    >({
      path: '/constants/non-residential-usage-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getResidentialAttributeTypes: this.apiCall<
      { residentialAttributeTypes: { key: string; description: string }[] },
      null
    >({
      path: '/constants/residential-attribute-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getResidentialHousingTypes: this.apiCall<{ residentialHousingTypes: { key: string; description: string }[] }, null>(
      {
        path: '/constants/residential-housing-type',
        requestType: 'get',
        options: { cacheDuration: 86_400 },
      },
    ),
    getSpecialistCellTypes: this.apiCall<
      { specialistCellTypes: { key: string; description: string; additionalInformation?: string }[] },
      null
    >({
      path: '/constants/specialist-cell-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
    getUsedForTypes: this.apiCall<{ usedForTypes: { key: string; description: string }[] }, null>({
      path: '/constants/used-for-type',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
  }

  locations = {
    convertCellToNonResCell: this.apiCall<
      Location,
      { locationId: string },
      { convertedCellType: string; otherConvertedCellType?: string }
    >({
      path: '/locations/:locationId/convert-cell-to-non-res-cell',
      requestType: 'put',
    }),
    deactivate: {
      temporary: this.apiCall<
        Location,
        { locationId: string },
        {
          deactivationReason: string
          deactivationReasonDescription: string
          proposedReactivationDate: string
          planetFmReference: string
        }
      >({
        path: '/locations/:locationId/deactivate/temporary',
        requestType: 'put',
      }),
    },
    getLocation: this.apiCall<Location, { locationId: string }>({
      path: '/locations/:locationId',
      requestType: 'get',
    }),
    getResidentialSummary: this.apiCall<ResidentialSummary, { prisonId: string; parentLocationId?: string }>({
      path: '/locations/residential-summary/:prisonId',
      queryParams: ['parentLocationId'],
      requestType: 'get',
    }),
    prison: {
      getArchivedLocations: this.apiCall<Location[], { prisonId: string }>({
        path: '/locations/prison/:prisonId/archived',
        requestType: 'get',
      }),
      getInactiveCells: this.apiCall<Location[], { prisonId: string; parentLocationId?: string }>({
        path: '/locations/prison/:prisonId/inactive-cells',
        queryParams: ['parentLocationId'],
        requestType: 'get',
      }),
    },
    updateCapacity: this.apiCall<Location, { locationId: string }, { maxCapacity?: number; workingCapacity?: number }>({
      path: '/locations/:locationId/capacity',
      requestType: 'put',
    }),
    updateSpecialistCellTypes: this.apiCall<Location, { locationId: string }, string[]>({
      path: '/locations/:locationId/specialist-cell-types',
      requestType: 'put',
    }),
  }

  prisonerLocations = {
    getPrisonersInLocation: this.apiCall<PrisonerLocation[], { locationId: string }>({
      path: '/prisoner-locations/id/:locationId',
      requestType: 'get',
    }),
  }

  signedOperationalCapacity = {
    get: this.apiCall<SignedOperationalCapacity, { prisonId: string }>({
      path: '/signed-op-cap/:prisonId',
      requestType: 'get',
    }),
    update: this.apiCall<
      SignedOperationalCapacity,
      NonNullable<unknown>,
      { signedOperationCapacity: number; prisonId: string; updatedBy: string }
    >({
      path: '/signed-op-cap/',
      requestType: 'post',
    }),
  }
}
