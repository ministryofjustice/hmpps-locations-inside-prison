import { dataAccess } from '../data'
import AuditService from './auditService'
import FeComponentsService from './feComponentsService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, feComponentsClient } = dataAccess()

  const auditService = new AuditService(hmppsAuditClient)
  const feComponentsService = new FeComponentsService(feComponentsClient)

  return {
    applicationInfo,
    auditService,
    feComponentsService,
  }
}

export type Services = ReturnType<typeof services>
