import { dataAccess } from '../data'
import AuditService from './auditService'
import FeComponentsService from './feComponentsService'
import LocationsService from './locationsService'
import AuthService from './authService'
import ManageUsersService from './manageUsersService'
import AnalyticsService from './analyticsService'
import PrisonService from './prisonService'
import { notificationServiceFactory } from './notificationService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    hmppsAuthClient,
    feComponentsClient,
    googleAnalyticsClient,
    locationsApiClient,
    manageUsersApiClient,
    prisonApiClient,
  } = dataAccess()

  const notificationService = notificationServiceFactory()
  const analyticsService = new AnalyticsService(googleAnalyticsClient)
  const auditService = new AuditService(hmppsAuditClient)
  const authService = new AuthService(hmppsAuthClient)
  const feComponentsService = new FeComponentsService(feComponentsClient)
  const locationsService = new LocationsService(locationsApiClient)
  const manageUsersService = new ManageUsersService(manageUsersApiClient)
  const prisonService = new PrisonService(prisonApiClient)

  return {
    notificationService,
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
