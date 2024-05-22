import FeComponentsClient, { AvailableComponent } from '../data/feComponentsClient'

export default class FeComponentsService {
  constructor(private readonly feComponentsClient: FeComponentsClient) {}

  async getComponents<T extends AvailableComponent[]>(components: T, token: string) {
    return this.feComponentsClient.getComponents(components, token)
  }
}
