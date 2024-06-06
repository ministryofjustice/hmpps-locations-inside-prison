import LocationsApiClient from '../data/locationsApiClient'

export default class LocationsService {
  constructor(private readonly locationsApiClient: LocationsApiClient) {}

  private constantDataMaps: { [key: string]: { [key: string]: string } } = {}

  private async getConstantDataMap(token: string, apiCallName: keyof LocationsApiClient['constants']) {
    if (!this.constantDataMaps[apiCallName]) {
      this.constantDataMaps[apiCallName] = Object.fromEntries(
        Object.values(await this.locationsApiClient.constants[apiCallName](token))[0].map(i => [i.key, i.description]),
      )
    }

    return this.constantDataMaps[apiCallName]
  }

  async getAccommodationType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getAccommodationTypes'))[key] || 'Unknown'
  }

  async getDeactivatedReason(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getDeactivatedReasons'))[key] || 'Unknown'
  }

  async getSpecialistCellType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getSpecialistCellTypes'))[key] || 'Unknown'
  }

  async getUsedForType(token: string, key: string) {
    return (await this.getConstantDataMap(token, 'getUsedForTypes'))[key] || 'Unknown'
  }

  async getResidentialSummary(token: string, prisonId: string, locationId?: string) {
    return this.locationsApiClient.locations.getResidentialSummary(token, { prisonId, parentLocationId: locationId })
  }
}
