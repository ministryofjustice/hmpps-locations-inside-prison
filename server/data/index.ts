/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import ManageUsersApiClient from './manageUsersApiClient'
import { redisClient } from './redisClient'
import config from '../config'
import FeComponentsClient from './feComponentsClient'
import HmppsAuditClient from './hmppsAuditClient'
import LocationsApiClient from './locationsApiClient'
import GoogleAnalyticsClient from './googleAnalyticsClient'
import logger from '../../logger'

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(redisClient) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    feComponentsClient: new FeComponentsClient(),
    googleAnalyticsClient: new GoogleAnalyticsClient(),
    hmppsAuthClient,
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    locationsApiClient: new LocationsApiClient(redisClient),
    manageUsersApiClient: new ManageUsersApiClient(redisClient),
    redisClient,
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export {
  AuthenticationClient,
  FeComponentsClient,
  HmppsAuditClient,
  LocationsApiClient,
  ManageUsersApiClient,
}
