import { dataAccess } from '../data'
import AuditService from './auditService'
import FeComponentsService from './feComponentsService'
import LocationsService from './locationsService'
import AuthService from './authService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, hmppsAuthClient, feComponentsClient, locationsApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const authService = new AuthService(hmppsAuthClient)
  const feComponentsService = new FeComponentsService(feComponentsClient)
  const locationsService = new LocationsService(locationsApiClient)

  return {
    applicationInfo,
    auditService,
    authService,
    feComponentsService,
    locationsService,
  }
}

export type Services = ReturnType<typeof services>
