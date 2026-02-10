import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import BaseApiClient from './baseApiClient'
import {
  Location,
  PrisonerLocation,
  LocationForLocalName,
  SignedOperationalCapacity,
  LocationResidentialSummary,
  PrisonResidentialSummary,
  PrisonConfiguration,
  StatusType,
  LocationType,
} from './types/locationsApi'
import { ManagementReportDefinition } from './types/locationsApi/managementReportDefinition'

import { RedisClient } from './redisClient'
import { ResidentialHierarchy } from './types/locationsApi/residentialHierarchy'
import { BulkCapacityUpdateChanges } from './types/locationsApi/bulkCapacityChanges'
import { CertificationApprovalRequest } from './types/locationsApi/certificationApprovalRequest'
import { CellCertificate } from './types/locationsApi/cellCertificate'

export default class LocationsApiClient extends BaseApiClient {
  constructor(redisClient: RedisClient, authenticationClient: AuthenticationClient) {
    super('LocationsApiClient', redisClient, config.apis.locationsApi, authenticationClient)
  }

  cellCertificates = {
    getById: this.apiCall<CellCertificate, { id: string }>({
      path: '/cell-certificates/:id',
      requestType: 'get',
    }),
    prison: {
      getAllForPrisonId: this.apiCall<CellCertificate[], { prisonId: string }>({
        path: '/cell-certificates/prison/:prisonId',
        requestType: 'get',
      }),
      getCurrentForPrisonId: this.apiCall<CellCertificate, { prisonId: string }>({
        path: '/cell-certificates/prison/:prisonId/current',
        requestType: 'get',
      }),
    },
  }

  certification = {
    location: {
      approve: this.apiCall<
        CertificationApprovalRequest,
        null,
        {
          approvalRequestReference: string
          comments?: string
        }
      >({
        path: '/certification/location/approve',
        requestType: 'put',
      }),
      reject: this.apiCall<
        CertificationApprovalRequest,
        null,
        {
          approvalRequestReference: string
          comments: string
        }
      >({
        path: '/certification/location/reject',
        requestType: 'put',
      }),
      requestApproval: this.apiCall<
        CertificationApprovalRequest,
        null,
        {
          locationId: string
          approvalType: string
        }
      >({
        path: '/certification/location/request-approval',
        requestType: 'put',
      }),
      withdraw: this.apiCall<
        CertificationApprovalRequest,
        null,
        {
          approvalRequestReference: string
          comments: string
        }
      >({
        path: '/certification/location/withdraw',
        requestType: 'put',
      }),
    },
    prison: {
      signedOpCapChange: this.apiCall<
        CertificationApprovalRequest,
        null,
        {
          prisonId: string
          signedOperationalCapacity: number
          reasonForChange: string
        }
      >({
        path: '/certification/prison/signed-op-cap-change',
        requestType: 'put',
      }),
    },
    requestApprovals: {
      getById: this.apiCall<CertificationApprovalRequest, { id: string }>({
        path: '/certification/request-approvals/:id',
        requestType: 'get',
      }),
      prison: {
        getAllForPrisonId: this.apiCall<CertificationApprovalRequest[], { prisonId: string; status?: string }>({
          path: '/certification/request-approvals/prison/:prisonId',
          queryParams: ['status'],
          requestType: 'get',
        }),
      },
    },
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
      {
        specialistCellTypes: {
          key: string
          description: string
          additionalInformation?: string
          attributes?: { affectsCapacity: boolean }
        }[]
      },
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
      capacityUpdate: this.apiCall<
        BulkCapacityUpdateChanges,
        null,
        {
          locations: {
            [id: string]: {
              maxCapacity: number
              workingCapacity: number
              certifiedNormalAccommodation: number
              cellMark: string
              inCellSanitation?: boolean
            }
          }
        }
      >({
        path: '/locations/bulk/capacity-update',
        requestType: 'put',
      }),
    },
    getLocationByLocalName: this.apiCall<
      LocationForLocalName,
      { prisonId: string; localName: string; parentLocationId?: string }
    >({
      path: '/locations/:prisonId/local-name/:localName',
      queryParams: ['parentLocationId'],
      requestType: 'get',
    }),
    getLocationByKey: this.apiCall<LocationForLocalName, { key: string }>({
      path: '/locations/key/:key?includeChildren',
      requestType: 'get',
    }),
    createWing: this.apiCall<
      Location,
      undefined,
      { prisonId: string; wingCode: string; wingDescription?: string; wingStructure: LocationType[] }
    >({
      path: '/locations/create-wing',
      requestType: 'post',
    }),
    createCells: this.apiCall<
      Location,
      undefined,
      {
        prisonId: string
        parentLocation: string
        newLevelAboveCells?: {
          levelCode: string
          levelLocalName?: string
          locationType: 'LANDING' | 'SPUR'
        }
        cellsUsedFor: string[]
        accommodationType: string
        cells: {
          code: string
          cellMark: string
          certifiedNormalAccommodation: number
          maxCapacity: number
          workingCapacity: number
          specialistCellTypes: string[]
          inCellSanitation: boolean
        }[]
      }
    >({
      path: '/locations/create-cells',
      requestType: 'post',
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
          requiresApproval: boolean
          reasonForChange?: string
        }
      >({
        path: '/locations/:locationId/deactivate/temporary',
        requestType: 'put',
      }),
    },
    deleteDraftLocation: this.apiCall<Location, { locationId: string }>({
      path: '/locations/:locationId',
      requestType: 'delete',
    }),
    editCells: this.apiCall<
      Location,
      undefined,
      {
        prisonId: string
        parentLocation: string
        cellsUsedFor: string[]
        accommodationType: string
        cells: {
          id?: string
          code: string
          cellMark: string
          certifiedNormalAccommodation: number
          maxCapacity: number
          workingCapacity: number
          specialistCellTypes: string[]
          inCellSanitation: boolean
        }[]
      }
    >({
      path: '/locations/edit-cells',
      requestType: 'put',
    }),
    getLocation: this.apiCall<Location, { locationId: string; includeHistory: string }>({
      path: '/locations/:locationId',
      queryParams: ['includeHistory'],
      requestType: 'get',
    }),
    getResidentialHierarchy: this.apiCall<ResidentialHierarchy[], { prisonId: string }>({
      path: '/locations/prison/:prisonId/residential-hierarchy',
      requestType: 'get',
    }),
    getResidentialHierarchyFromParent: this.apiCall<
      ResidentialHierarchy[],
      {
        prisonId: string
        parentPathHierarchy: string
        maxLevel?: string
        includeVirtualLocations?: string
        includeInactive?: string
      }
    >({
      path: '/locations/prison/:prisonId/residential-hierarchy/:parentPathHierarchy',
      queryParams: ['maxLevel', 'includeVirtualLocations', 'includeInactive'],
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
    updateCapacity: this.apiCall<
      Location,
      { locationId: string },
      { maxCapacity?: number; workingCapacity?: number; certifiedNormalAccommodation?: number }
    >({
      path: '/locations/:locationId/capacity',
      requestType: 'put',
    }),
    updateCellMark: this.apiCall<Location, { locationId: string }, { cellMark: string; reasonForChange?: string }>({
      path: '/locations/residential/:locationId/cell-mark-change',
      requestType: 'put',
    }),
    updateCellSanitation: this.apiCall<
      Location,
      { locationId: string },
      { inCellSanitation: boolean; reasonForChange?: string }
    >({
      path: '/locations/residential/:locationId/cell-sanitation-change',
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
    patchLocation: this.apiCall<
      Location,
      { locationId: string },
      { code?: string; cellMark?: string; inCellSanitation?: boolean }
    >({
      path: '/locations/residential/:locationId',
      requestType: 'patch',
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

  prisonConfiguration = {
    get: this.apiCall<PrisonConfiguration, { prisonId: string }>({
      path: '/prison-configuration/:prisonId',
      requestType: 'get',
      options: { cacheDuration: 3600 },
    }),
    updateResiStatus: this.apiCall<PrisonConfiguration, { prisonId: string; status: StatusType }>({
      path: '/prison-configuration/:prisonId/resi-service/:status',
      requestType: 'put',
    }),
    updateNonResiStatus: this.apiCall<PrisonConfiguration, { prisonId: string; status: StatusType }>({
      path: '/prison-configuration/:prisonId/non-resi-service/:status',
      requestType: 'put',
    }),
    updateCertificationApproval: this.apiCall<PrisonConfiguration, { prisonId: string; status: StatusType }>({
      path: '/prison-configuration/:prisonId/certification-approval-required/:status',
      requestType: 'put',
    }),
    updateIncludeSegInRollCount: this.apiCall<PrisonConfiguration, { prisonId: string; status: StatusType }>({
      path: '/prison-configuration/:prisonId/include-seg-in-roll-count/:status',
      requestType: 'put',
    }),
  }
}
