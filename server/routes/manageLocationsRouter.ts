import express from 'express'
import manageLocationsIndex from '../controllers/manageLocations/manageLocationsIndex'
import populatePrisonId from '../middleware/populatePrisonId'
import populateResidentialSummary from '../middleware/populateResidentialSummary'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
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
    // TODO: log page view middleware
    // logPageView(services.auditService, Page.MANAGE_INDEX),
    manageLocationsIndex,
  )
  return router
}
export default controller
