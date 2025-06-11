import express from 'express'
import manageLocationsIndex from '../controllers/manageLocations/manageLocationsIndex'
import populatePrisonId from '../middleware/populatePrisonId'
import populateResidentialSummary from '../middleware/populateResidentialSummary'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import validateCaseload from '../middleware/validateCaseload'
import logPageView from '../middleware/logPageView'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'

import addBreadcrumb from '../middleware/addBreadcrumb'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/',
    populateResidentialSummary(services),
    populateBreadcrumbsForLocation,
    addBreadcrumb({ title: '', href: '/' }),
    logPageView(services.auditService, Page.LOCATION_CREATE),
    manageLocationsIndex,
  )
  return router
}
export default controller
