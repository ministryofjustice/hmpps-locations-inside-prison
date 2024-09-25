/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import HmppsAuthClient from './hmppsAuthClient'
import ManageUsersApiClient from './manageUsersApiClient'
import { redisClient } from './redisClient'
import config from '../config'
import FeComponentsClient from './feComponentsClient'
import HmppsAuditClient from './hmppsAuditClient'
import LocationsApiClient from './locationsApiClient'
import GoogleAnalyticsClient from './googleAnalyticsClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
  feComponentsClient: new FeComponentsClient(),
  googleAnalyticsClient: new GoogleAnalyticsClient(),
  hmppsAuthClient: new HmppsAuthClient(
    config.redis.enabled ? new RedisTokenStore(redisClient) : new InMemoryTokenStore(),
  ),
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  locationsApiClient: new LocationsApiClient(redisClient),
  manageUsersApiClient: new ManageUsersApiClient(redisClient),
  redisClient,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  FeComponentsClient,
  HmppsAuditClient,
  HmppsAuthClient,
  LocationsApiClient,
  ManageUsersApiClient,
  RestClientBuilder,
}
