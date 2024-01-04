import { dataAccess } from '../data'
import AuditService from './auditService'
import UserService from './userService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, manageUsersApiClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const userService = new UserService(manageUsersApiClient)

  return {
    auditService,
    applicationInfo,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
