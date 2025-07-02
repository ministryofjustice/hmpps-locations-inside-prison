import express from 'express'
import manageLocationsIndex from '../controllers/manageLocations/manageLocationsIndex'
import populatePrisonId from '../middleware/populatePrisonId'
import populateDecoratedResidentialSummary from '../middleware/populateDecoratedResidentialSummary'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'
import addBreadcrumb from '../middleware/addBreadcrumb'
import protectRoute from '../middleware/protectRoute'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/',
    protectRoute('create_location'),
    populateDecoratedResidentialSummary(services),
    populateBreadcrumbsForLocation,
    addBreadcrumb({ title: '', href: '/' }),
    logPageView(services.auditService, Page.LOCATION_CREATE),
    manageLocationsIndex,
  )

  return router
}

export default controller
