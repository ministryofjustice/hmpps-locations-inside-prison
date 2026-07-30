import { Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import addBreadcrumb from '../middleware/addBreadcrumb'
import logPageView from '../middleware/logPageView'
import addServicesToRequest from '../middleware/addServicesToRequest'

import capacityManagementDashboard from '../controllers/capacityManagementDashboard'
import protectRoute from '../middleware/protectRoute'
import config from '../config'
import prisonRouter from './prisonRouter'
import devRouter from './devRouter'
import setCanAccess from '../middleware/setCanAccess'
import legacyRedirectRouter from './legacyRedirectRouter'
import addRootBreadcrumb from '../middleware/addRootBreadcrumb'

export default function routes(services: Services): Router {
  const router = Router()

  router.use(addServicesToRequest(services))
  router.use(setCanAccess)

  if (config.developerMode) {
    router.use('/dev', devRouter)
  }

  router.get(
    '/capacity-management-dashboard',
    protectRoute('certificate_view_management'),
    addRootBreadcrumb,
    addBreadcrumb({ title: '', href: '/' }),
    logPageView(services.auditService, Page.CAPACITY_MANAGEMENT_DASHBOARD),
    asyncMiddleware(capacityManagementDashboard),
  )

  router.use(legacyRedirectRouter)

  router.use('/:prisonId?', prisonRouter(services))

  return router
}
