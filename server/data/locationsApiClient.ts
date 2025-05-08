import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import BaseApiClient from './baseApiClient'
import { Location, PrisonerLocation, LocationForLocalName, SignedOperationalCapacity } from './types/locationsApi'
import { LocationResidentialSummary } from './types/locationsApi/locationResidentialSummary'
import { PrisonResidentialSummary } from './types/locationsApi/prisonResidentialSummary'
import { ManagementReportDefinition } from './types/locationsApi/managementReportDefinition'

import { RedisClient } from './redisClient'

export default class LocationsApiClient extends BaseApiClient {
  constructor(
    protected readonly redisClient: RedisClient,
    authenticationClient: AuthenticationClient,
  ) {
    super('LocationsApiClient', redisClient, config.apis.locationsApi, authenticationClient)
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
    getUsedForTypesForPrison: this.apiCall<
      { usedForTypes: { key: string; description: string }[] },
      { prisonId: string }
    >({
      path: '/constants/used-for-type/:prisonId',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
  }

  locations = {
    bulk: {
      reactivate: this.apiCall<
        Location[],
        null,
        {
          locations: {
            [id: string]: {
              cascadeReactivation?: boolean
              capacity?: { maxCapacity?: number; workingCapacity?: number }
            }
          }
        }
      >({
        path: '/locations/bulk/reactivate',
        requestType: 'put',
      }),
    },
    getLocationByLocalName: this.apiCall<
      LocationForLocalName,
      { prisonId: string; localName?: string; parentLocationId?: string }
    >({
      path: '/locations/:prisonId/local-name/:localName',
      queryParams: ['parentLocationId'],
      requestType: 'get',
    }),
    convertCellToNonResCell: this.apiCall<
      Location,
      { locationId: string },
      { convertedCellType: string; otherConvertedCellType?: string }
    >({
      path: '/locations/:locationId/convert-cell-to-non-res-cell',
      requestType: 'put',
    }),
    convertToCell: this.apiCall<
      Location,
      { locationId: string },
      {
        accommodationType: string
        specialistCellTypes: string[]
        maxCapacity: number
        workingCapacity: number
        usedForTypes: string[]
      }
    >({
      path: '/locations/:locationId/convert-to-cell',
      requestType: 'put',
    }),
    deactivate: {
      permanent: this.apiCall<Location, { locationId: string }, { reason: string }>({
        path: '/locations/:locationId/deactivate/permanent',
        requestType: 'put',
      }),
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
    getLocation: this.apiCall<Location, { locationId: string; includeHistory: string }>({
      path: '/locations/:locationId',
      queryParams: ['includeHistory'],
      requestType: 'get',
    }),
    getResidentialSummary: this.apiCall<
      LocationResidentialSummary | PrisonResidentialSummary,
      { prisonId: string; parentLocationId?: string }
    >({
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
    updateUsedForTypes: this.apiCall<Location, { locationId: string }, string[]>({
      path: '/locations/:locationId/used-for-type',
      requestType: 'put',
    }),
    updateLocalName: this.apiCall<Location, { locationId: string }, { localName?: string; updatedBy?: string }>({
      path: '/locations/:locationId/change-local-name',
      requestType: 'put',
    }),
    updateTemporaryDeactivation: this.apiCall<
      Location,
      { locationId: string },
      {
        deactivationReason: string
        deactivationReasonDescription?: string
        proposedReactivationDate?: string
        planetFmReference?: string
      }
    >({
      path: '/locations/:locationId/update/temporary-deactivation',
      requestType: 'put',
    }),
    updateNonResCell: this.apiCall<
      Location,
      { locationId: string },
      { convertedCellType: string; otherConvertedCellType?: string }
    >({
      path: '/locations/:locationId/update-non-res-cell',
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

  managementReportDefinitions = {
    get: this.apiCall<ManagementReportDefinition[], null>({
      path: '/definitions',
      requestType: 'get',
    }),
  }
}
