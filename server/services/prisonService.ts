import { PrisonApiClient } from '../data/prisonApiClient'
import { ServiceCode } from '../data/types/locationsApi/serviceCode'
import { ModuleName } from '../data/types/locationsApi/moduleName'

export default class PrisonService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  async getServiceStatus(token: string, prisonId: string, serviceCode: ServiceCode) {
    return this.prisonApiClient.servicePrisons.getServiceStatus(token, { prisonId, serviceCode })
  }

  async activatePrisonService(token: string, prisonId: string, serviceCode: ServiceCode) {
    return this.prisonApiClient.servicePrisons.activatePrisonService(token, { prisonId, serviceCode })
  }

  async deactivatePrisonService(token: string, prisonId: string, serviceCode: ServiceCode) {
    return this.prisonApiClient.servicePrisons.deactivatePrisonService(token, { prisonId, serviceCode })
  }

  async getScreenStatus(token: string, prisonId: string, moduleName: ModuleName = 'OIMMHOLO') {
    return this.prisonApiClient.splashScreen.getScreenStatus(token, { prisonId, moduleName })
  }

  async addCondition(token: string, prisonId: string, block: boolean = true, moduleName: ModuleName = 'OIMMHOLO') {
    return this.prisonApiClient.splashScreen.addCondition(
      token,
      {
        prisonId,
        moduleName,
      },
      {
        conditionType: 'CASELOAD',
        conditionValue: `${prisonId}`,
        blockAccess: block,
      },
    )
  }

  async removeCondition(token: string, prisonId: string, moduleName: ModuleName = 'OIMMHOLO') {
    return this.prisonApiClient.splashScreen.removeCondition(token, { prisonId, moduleName })
  }

  async updateScreen(token: string, prisonId: string, block: boolean, moduleName: ModuleName = 'OIMMHOLO') {
    return this.prisonApiClient.splashScreen.updateScreen(token, {
      prisonId,
      moduleName,
      blockScreen: block === true ? 'true' : 'false',
    })
  }
}
