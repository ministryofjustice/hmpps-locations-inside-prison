import { pickBy } from 'lodash'
import LocationsApiClient from '../data/locationsApiClient'
import { ManagementReportDefinition } from '../data/types/locationsApi/managementReportDefinition'
import { ResidentialHierarchy } from '../data/types/locationsApi/residentialHierarchy'
import { LocationType, StatusType } from '../data/types/locationsApi'
import { BulkCapacityUpdate } from '../data/types/locationsApi/bulkCapacityChanges'

export default class LocationsService {
  constructor(private readonly locationsApiClient: LocationsApiClient) {}

  private async getConstantDataMap(token: string, apiCallName: keyof LocationsApiClient['constants']) {
    return Object.fromEntries(
      Object.values(await this.locationsApiClient.constants[apiCallName](token))[0].map(i => [i.key, i.description]),
    )
  }

  async convertCellToNonResCell(
    token: string,
    locationId: string,
    convertedCellType: string,
    otherConvertedCellType?: string,
  ) {
    const params = pickBy({ convertedCellType, otherConvertedCellType }) as {
      convertedCellType: string
      otherConvertedCellType?: string
    }
    return this.locationsApiClient.locations.convertCellToNonResCell(token, { locationId }, params)
  }

  async convertToCell(
    token: string,
    locationId: string,
    accommodationType: string,
    specialistCellTypes: string[],
    maxCapacity: number,
    workingCapacity: number,
    usedForTypes: string[],
  ) {
    return this.locationsApiClient.locations.convertToCell(
      token,
      { locationId },
      { accommodationType, specialistCellTypes, maxCapacity, workingCapacity, usedForTypes },
    )
  }

  async createCertificationRequestForLocation(token: string, approvalType: string, locationId: string) {
    return this.locationsApiClient.certification.location.requestApproval(token, null, { approvalType, locationId })
  }

  async createCertificationRequestForSignedOpCap(
    token: string,
    prisonId: string,
    signedOperationalCapacity: number,
    reasonForChange: string,
  ) {
    return this.locationsApiClient.certification.prison.signedOpCapChange(token, null, {
      prisonId,
      signedOperationalCapacity,
      reasonForChange,
    })
  }

  async deactivatePermanent(token: string, locationId: string, reason: string) {
    return this.locationsApiClient.locations.deactivate.permanent(token, { locationId }, { reason })
  }

  async deactivateTemporary(
    token: string,
    locationId: string,
    deactivationReason: string,
    deactivationReasonDescription: string,
    proposedReactivationDate: string,
    planetFmReference: string,
  ) {
    return this.locationsApiClient.locations.deactivate.temporary(
      token,
      {
        locationId,
      },
      {
        deactivationReason,
        deactivationReasonDescription,
        proposedReactivationDate,
        planetFmReference,
      },
    )
  }

  async deleteDraftLocation(token: string, locationId: string) {
    return this.locationsApiClient.locations.deleteDraftLocation(token, { locationId })
  }

  async getAccommodationType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getAccommodationTypes'))[key] || 'Unknown'
  }

  async getAccommodationTypes(token: string) {
    return (await this.locationsApiClient.constants.getAccommodationTypes(token)).accommodationTypes
  }

  async getArchivedLocations(token: string, prisonId: string) {
    return this.locationsApiClient.locations.prison.getArchivedLocations(token, { prisonId })
  }

  async getCertificateApprovalRequests(token: string, prisonId: string, status = 'PENDING') {
    return this.locationsApiClient.certification.requestApprovals.prison.getAllForPrisonId(token, { prisonId, status })
  }

  async getConvertedCellType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getConvertedCellTypes'))[key] || 'Unknown'
  }

  async getConvertedCellTypes(token: string) {
    return (await this.locationsApiClient.constants.getConvertedCellTypes(token)).convertedCellTypes
  }

  async getDeactivatedReason(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getDeactivatedReasons'))[key] || 'Unknown'
  }

  async getDeactivatedReasons(token: string) {
    return this.getConstantDataMap(token, 'getDeactivatedReasons')
  }

  async getInactiveCells(token: string, prisonId: string, locationId?: string) {
    return this.locationsApiClient.locations.prison.getInactiveCells(token, { prisonId, parentLocationId: locationId })
  }

  async getLocation(token: string, locationId: string, includeHistory: boolean = false) {
    const params = {
      locationId,
      includeHistory: includeHistory ? 'true' : 'false',
    }
    return this.locationsApiClient.locations.getLocation(token, params)
  }

  async getLocationType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getLocationTypes'))[key] || 'Unknown'
  }

  async getLocationByLocalName(token: string, prisonId: string, localName: string, parentLocationId?: string) {
    return this.locationsApiClient.locations.getLocationByLocalName(token, { prisonId, localName, parentLocationId })
  }

  async getLocationByKey(token: string, key: string) {
    return this.locationsApiClient.locations.getLocationByKey(token, { key })
  }

  async getNonResidentialUsageType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getNonResidentialUsageTypes'))[key] || 'Unknown'
  }

  async getPrisonersInLocation(token: string, locationId: string) {
    return this.locationsApiClient.prisonerLocations.getPrisonersInLocation(token, { locationId })
  }

  async getResidentialAttributeType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getResidentialAttributeTypes'))[key] || 'Unknown'
  }

  async getResidentialHierarchy(
    token: string,
    prisonId: string,
    {
      parentPathHierarchy,
      maxLevel,
      includeVirtualLocations,
      includeInactive,
    }: {
      parentPathHierarchy?: string
      maxLevel?: number
      includeVirtualLocations?: boolean
      includeInactive?: boolean
    },
  ): Promise<ResidentialHierarchy[]> {
    if (parentPathHierarchy) {
      return this.locationsApiClient.locations.getResidentialHierarchyFromParent(token, {
        prisonId,
        parentPathHierarchy,
        maxLevel: maxLevel?.toString(),
        includeVirtualLocations: includeVirtualLocations?.toString(),
        includeInactive: includeInactive?.toString(),
      })
    }

    return this.locationsApiClient.locations.getResidentialHierarchy(token, { prisonId })
  }

  async getResidentialHousingType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getResidentialHousingTypes'))[key] || 'Unknown'
  }

  async getResidentialSummary(token: string, prisonId: string, locationId?: string) {
    return this.locationsApiClient.locations.getResidentialSummary(token, { prisonId, parentLocationId: locationId })
  }

  async getSignedOperationalCapacity(token: string, prisonId: string) {
    return this.locationsApiClient.signedOperationalCapacity.get(token, { prisonId })
  }

  async getSpecialistCellType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getSpecialistCellTypes'))[key] || 'Unknown'
  }

  async getSpecialistCellTypes(token: string) {
    return (await this.locationsApiClient.constants.getSpecialistCellTypes(token)).specialistCellTypes
  }

  async getUsedForType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getUsedForTypes'))[key] || 'Unknown'
  }

  async getUsedForTypes(token: string) {
    return (await this.locationsApiClient.constants.getUsedForTypes(token)).usedForTypes
  }

  async getUsedForTypesForPrison(token: string, prisonId: string) {
    return (await this.locationsApiClient.constants.getUsedForTypesForPrison(token, { prisonId })).usedForTypes
  }

  async reactivateCell(token: string, locationId: string, capacity: { maxCapacity: number; workingCapacity: number }) {
    return this.locationsApiClient.locations.bulk.reactivate(token, null, { locations: { [locationId]: { capacity } } })
  }

  async reactivateBulk(
    token: string,
    locations: Parameters<LocationsApiClient['locations']['bulk']['reactivate']>[2]['locations'],
  ) {
    return this.locationsApiClient.locations.bulk.reactivate(token, null, { locations })
  }

  async updateCapacity(token: string, locationId: string, maxCapacity?: number, workingCapacity?: number) {
    return this.locationsApiClient.locations.updateCapacity(token, { locationId }, { maxCapacity, workingCapacity })
  }

  async updateBulkCapacity(token: string, bulkCapacityUpdate: BulkCapacityUpdate) {
    return this.locationsApiClient.locations.bulk.capacityUpdate(token, null, { locations: bulkCapacityUpdate })
  }

  async updateSignedOperationalCapacity(
    token: string,
    prisonId: string,
    signedOperationCapacity?: number,
    updatedBy?: string,
  ) {
    return this.locationsApiClient.signedOperationalCapacity.update(
      token,
      {},
      { signedOperationCapacity, prisonId, updatedBy },
    )
  }

  async updateSpecialistCellTypes(token: string, locationId: string, cellTypes?: string[]) {
    return this.locationsApiClient.locations.updateSpecialistCellTypes(token, { locationId }, cellTypes)
  }

  async updateTemporaryDeactivation(
    token: string,
    locationId: string,
    deactivationReason: string,
    deactivationReasonDescription?: string,
    proposedReactivationDate?: string,
    planetFmReference?: string,
  ) {
    return this.locationsApiClient.locations.updateTemporaryDeactivation(
      token,
      { locationId },
      { deactivationReason, deactivationReasonDescription, proposedReactivationDate, planetFmReference },
    )
  }

  async updateUsedForTypes(token: string, locationId: string, usedForType?: string[]) {
    return this.locationsApiClient.locations.updateUsedForTypes(token, { locationId }, usedForType)
  }

  async updateLocalName(token: string, locationId: string, localName?: string, updatedBy?: string) {
    return this.locationsApiClient.locations.updateLocalName(token, { locationId }, { localName, updatedBy })
  }

  async updateLocationCode(token: string, locationId: string, code: string) {
    return this.locationsApiClient.locations.updateLocationCode(token, { locationId }, { code })
  }

  async changeNonResType(
    token: string,
    locationId: string,
    convertedCellType: string,
    otherConvertedCellType?: string,
  ) {
    const params = pickBy({ convertedCellType, otherConvertedCellType }) as {
      convertedCellType: string
      otherConvertedCellType?: string
    }
    return this.locationsApiClient.locations.updateNonResCell(token, { locationId }, params)
  }

  async getManagementReportDefinitions(token: string): Promise<ManagementReportDefinition[]> {
    return this.locationsApiClient.managementReportDefinitions.get(token)
  }

  async getPrisonConfiguration(token: string, prisonId: string) {
    return this.locationsApiClient.prisonConfiguration.get(token, { prisonId })
  }

  async updateResiStatus(token: string, prisonId: string, status: StatusType) {
    await this.locationsApiClient.prisonConfiguration.updateResiStatus(token, { prisonId, status })
    await this.locationsApiClient.prisonConfiguration.get.clearCache({ prisonId })
  }

  async updateCertificationApproval(token: string, prisonId: string, status: StatusType) {
    await this.locationsApiClient.prisonConfiguration.updateCertificationApproval(token, { prisonId, status })
    await this.locationsApiClient.prisonConfiguration.get.clearCache({ prisonId })
  }

  async createWing(
    token: string,
    prisonId: string,
    wingCode: string,
    wingStructure: LocationType[],
    wingDescription?: string,
  ) {
    return this.locationsApiClient.locations.createWing(token, undefined, {
      prisonId,
      wingCode,
      wingStructure,
      wingDescription,
    })
  }

  async createCells(token: string, data: Parameters<LocationsApiClient['locations']['createCells']>[2]) {
    return this.locationsApiClient.locations.createCells(token, undefined, data)
  }
}
