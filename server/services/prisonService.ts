import PrisonApiClient from '../data/prisonApiClient'
import { ServiceCode } from '../data/types/locationsApi/serviceCode'

export default class PrisonService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  async getServiceStatus(token: string, prisonId: string, serviceCode: ServiceCode) {
    return this.prisonApiClient.servicePrisons.getServiceStatus(token, { prisonId, serviceCode })
  }

  async activatePrisonService(token: string, prisonId: string, serviceCode: ServiceCode) {
    return this.prisonApiClient.servicePrisons.activatePrisonService(token, { prisonId, serviceCode })
  }
}
