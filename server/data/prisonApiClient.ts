import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import BaseApiClient from './baseApiClient'
import { RedisClient } from './redisClient'
import config from '../config'
import { ServiceCode } from './types/locationsApi/serviceCode'
import { ModuleName } from './types/locationsApi/moduleName'

export interface PrisonDetails {
  prisonId: string
  prison: string
}

export interface SplashScreen {
  moduleName: string
  warningText: string
  blockedText: string
  blockAccessType: string
  conditions: SplashCondition[]
}

export interface SplashCondition {
  conditionType: string
  conditionValue: string
  blockAccess: boolean
}

export class PrisonApiClient extends BaseApiClient {
  constructor(redisClient: RedisClient, authenticationClient: AuthenticationClient) {
    super('prisonApiClient', redisClient, config.apis.prisonApi, authenticationClient)
  }

  servicePrisons = {
    getServiceStatus: this.apiCall<'', { serviceCode: ServiceCode; prisonId: string }>({
      path: '/api/agency-switches/:serviceCode/agency/:prisonId',
      requestType: 'get',
    }),
    activatePrisonService: this.apiCall<PrisonDetails, { serviceCode: ServiceCode; prisonId: string }>({
      path: '/api/agency-switches/:serviceCode/agency/:prisonId',
      requestType: 'post',
    }),
    deactivatePrisonService: this.apiCall<PrisonDetails, { serviceCode: ServiceCode; prisonId: string }>({
      path: '/api/agency-switches/:serviceCode/agency/:prisonId',
      requestType: 'delete',
    }),
  }

  splashScreen = {
    getScreenStatus: this.apiCall<SplashCondition, { moduleName: ModuleName; prisonId: string }>({
      path: '/api/splash-screen/:moduleName/condition/CASELOAD/:prisonId',
      requestType: 'get',
    }),
    addCondition: this.apiCall<
      SplashScreen,
      { moduleName: ModuleName; prisonId: string },
      {
        conditionType: string
        conditionValue: string
        blockAccess: boolean
      }
    >({
      path: '/api/splash-screen/:moduleName/condition',
      requestType: 'post',
    }),
    removeCondition: this.apiCall<SplashScreen, { moduleName: ModuleName; prisonId: string }>({
      path: '/api/splash-screen/:moduleName/condition/CASELOAD/:prisonId',
      requestType: 'delete',
    }),
    updateScreen: this.apiCall<SplashScreen, { moduleName: ModuleName; prisonId: string; blockScreen: string }>({
      path: '/api/splash-screen/:moduleName/condition/CASELOAD/:prisonId/:blockScreen',
      requestType: 'put',
    }),
  }
}
