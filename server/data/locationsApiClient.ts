import config from '../config'
import BaseApiClient from './baseApiClient'

export interface Location {
  id: string
  prisonId: string
  code: string
  pathHierarchy: string
  locationType: string
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
  status: string
  convertedCellType: string
  otherConvertedCellType: string
  active: boolean
  deactivatedByParent: boolean
  deactivatedDate: string
  deactivatedReason: string
  deactivatedBy: string
  proposedReactivationDate: string
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

interface ResidentialSummary {
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
    getSpecialistCellTypes: this.apiCall<{ specialistCellTypes: { key: string; description: string }[] }, null>({
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
    getResidentialSummary: this.apiCall<ResidentialSummary, { prisonId: string; parentLocationId?: string }>({
      path: '/locations/residential-summary/:prisonId',
      queryParams: ['parentLocationId'],
      requestType: 'get',
    }),
    prison: {
      getInactiveCells: this.apiCall<Location[], { prisonId: string; parentLocationId?: string }>({
        path: '/locations/prison/:prisonId/inactive-cells',
        queryParams: ['parentLocationId'],
        requestType: 'get',
      }),
    },
  }
}
