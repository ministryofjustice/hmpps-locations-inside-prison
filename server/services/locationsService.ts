import LocationsApiClient from '../data/locationsApiClient'

export default class LocationsService {
  constructor(private readonly locationsApiClient: LocationsApiClient) {}

  async getAccommodationTypes(token: string) {
    return this.locationsApiClient.constants.getAccommodationTypes(token)
  }

  async getUsedForTypes(token: string) {
    return this.locationsApiClient.constants.getUsedForTypes(token)
  }

  async getResidentialSummary(token: string, prisonId: string) {
    return this.locationsApiClient.locations.getResidentialSummary(token, { prisonId })
  }
}
