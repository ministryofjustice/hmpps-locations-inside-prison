import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import BaseApiClient from './baseApiClient'
import { RedisClient } from './redisClient'
import config from '../config'
import { ServiceCode } from './types/locationsApi/serviceCode'

export interface PrisonDetails {
  prisonId: string
  prison: string
}

export default class PrisonApiClient extends BaseApiClient {
  constructor(
    protected readonly redisClient: RedisClient,
    authenticationClient: AuthenticationClient,
  ) {
    super('prisonApiClient', redisClient, config.apis.prisonApi, authenticationClient)
  }

  servicePrisons = {
    getServiceStatus: this.apiCall<'', { serviceCode: ServiceCode; prisonId: string }>({
      path: '/api/service-prisons/:serviceCode/prison/:prisonId',
      requestType: 'get',
    }),
    activatePrisonService: this.apiCall<PrisonDetails, { serviceCode: ServiceCode; prisonId: string }>({
      path: '/api/service-prisons/:serviceCode/prison/:prisonId',
      requestType: 'post',
    }),
  }
}
