import { PrisonApiClient } from '../data/prisonApiClient'

export default class PrisonService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  async getScreenStatus(token: string, prisonId: string) {
    return this.prisonApiClient.splashScreen.getScreenStatus(token, { prisonId, moduleName: 'OIMMHOLO' })
  }

  async addCondition(token: string, prisonId: string, block: boolean = true) {
    return this.prisonApiClient.splashScreen.addCondition(
      token,
      {
        prisonId,
        moduleName: 'OIMMHOLO',
      },
      {
        conditionType: 'CASELOAD',
        conditionValue: `${prisonId}`,
        blockAccess: block,
      },
    )
  }

  async removeCondition(token: string, prisonId: string) {
    return this.prisonApiClient.splashScreen.removeCondition(token, { prisonId, moduleName: 'OIMMHOLO' })
  }

  async updateScreen(token: string, prisonId: string, block: boolean) {
    return this.prisonApiClient.splashScreen.updateScreen(token, {
      prisonId,
      moduleName: 'OIMMHOLO',
      blockScreen: block === true ? 'true' : 'false',
    })
  }
}
