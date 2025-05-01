import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'

export interface Component {
  html: string
  css: string[]
  javascript: string[]
}

export type AvailableComponent = 'header' | 'footer'

type CaseLoad = {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

type Service = {
  description: string
  heading: string
  href: string
  id: string
}

export interface FeComponentsMeta {
  activeCaseLoad: CaseLoad
  caseLoads: CaseLoad[]
  services: Service[]
}

export interface FeComponentsResponse {
  header?: Component
  footer?: Component
  meta: FeComponentsMeta
}

export default class FeComponentsClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('FeComponentsClient', config.apis.frontendComponents, logger, authenticationClient)
  }

  getComponents<T extends AvailableComponent[]>(components: T, userToken: string): Promise<FeComponentsResponse> {
    return this.get<FeComponentsResponse>({
      path: `/components`,
      query: `component=${components.join('&component=')}`,
      headers: { 'x-user-token': userToken },
    })
  }
}
