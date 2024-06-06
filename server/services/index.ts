import { dataAccess } from '../data'
import AuditService from './auditService'
import FeComponentsService from './feComponentsService'
import LocationsService from './locationsService'
import AuthService from './authService'
import ManageUsersService from './manageUsersService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuditClient,
    hmppsAuthClient,
    feComponentsClient,
    locationsApiClient,
    manageUsersApiClient,
  } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const authService = new AuthService(hmppsAuthClient)
  const feComponentsService = new FeComponentsService(feComponentsClient)
  const locationsService = new LocationsService(locationsApiClient)
  const manageUsersService = new ManageUsersService(manageUsersApiClient)

  return {
    applicationInfo,
    auditService,
    authService,
    feComponentsService,
    locationsService,
    manageUsersService,
  }
}

export type Services = ReturnType<typeof services>
