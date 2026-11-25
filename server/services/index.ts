import { AuditServiceFactory, type SubjectType } from '@ministryofjustice/hmpps-audit-client'
import { dataAccess } from '../data'
import config from '../config'
import logger from '../../logger'
import FeComponentsService from './feComponentsService'
import LocationsService from './locationsService'
import AuthService from './authService'
import ManageUsersService from './manageUsersService'
import AnalyticsService from './analyticsService'
import PrisonService from './prisonService'
import NotificationService from './notificationService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
    feComponentsClient,
    googleAnalyticsClient,
    locationsApiClient,
    manageUsersApiClient,
    prisonApiClient,
    notificationClient,
  } = dataAccess()
  const notificationService = new NotificationService(notificationClient)
  const analyticsService = new AnalyticsService(googleAnalyticsClient)
  // PRISON_ID is this service's own subject type, used when a prison's settings are changed
  const auditService = AuditServiceFactory.createInstance<string, SubjectType | 'PRISON_ID'>(config.sqs.audit, logger)
  const authService = new AuthService(hmppsAuthClient)
  const feComponentsService = new FeComponentsService(feComponentsClient)
  const locationsService = new LocationsService(locationsApiClient)
  const manageUsersService = new ManageUsersService(manageUsersApiClient)
  const prisonService = new PrisonService(prisonApiClient)

  return {
    notifyService: notificationService,
    analyticsService,
    applicationInfo,
    auditService,
    authService,
    feComponentsService,
    locationsService,
    manageUsersService,
    prisonService,
  }
}

export type Services = ReturnType<typeof services>
