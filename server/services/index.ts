import { createDprServices } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/utils/CreateDprServices'
import { dataAccess } from '../data'
import AuditService from './auditService'
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
    hmppsAuditClient,
    hmppsAuthClient,
    feComponentsClient,
    googleAnalyticsClient,
    locationsApiClient,
    manageUsersApiClient,
    prisonApiClient,
    notificationClient,
    reportingClient,
    dashboardClient,
    reportDataStore,
    productCollectionClient,
    featureFlagService,
    missingReportClient,
  } = dataAccess()
  const notificationService = new NotificationService(notificationClient)
  const analyticsService = new AnalyticsService(googleAnalyticsClient)
  const auditService = new AuditService(hmppsAuditClient)
  const authService = new AuthService(hmppsAuthClient)
  const feComponentsService = new FeComponentsService(feComponentsClient)
  const locationsService = new LocationsService(locationsApiClient)
  const manageUsersService = new ManageUsersService(manageUsersApiClient)
  const prisonService = new PrisonService(prisonApiClient)

  const featureConfig = {
    bookmarking: true, // Disables bookmarking feature
    download: true, // Disables download feature
    saveDefaults: true, // Disables save user defaults feature
  }

  const dprServices = createDprServices(
    {
      reportingClient,
      dashboardClient,
      reportDataStore,
      missingReportClient,
      productCollectionClient,
      featureFlagService,
    },
    featureConfig,
  )

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
    ...dprServices,
  }
}

export type Services = ReturnType<typeof services>
