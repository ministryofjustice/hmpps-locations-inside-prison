import { pickBy } from 'lodash'
import LocationsApiClient from '../data/locationsApiClient'

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

  async getAccommodationType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getAccommodationTypes'))[key] || 'Unknown'
  }

  async getAccommodationTypes(token: string) {
    return (await this.locationsApiClient.constants.getAccommodationTypes(token)).accommodationTypes
  }

  async getArchivedLocations(token: string, prisonId: string) {
    return this.locationsApiClient.locations.prison.getArchivedLocations(token, { prisonId })
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

  async getLocationByLocalName(token: string, prisonId: string, localName: string) {
    return this.locationsApiClient.locations.getLocationByLocalName(token, { prisonId, localName })
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
}
