import express from 'express'
import viewLocationsIndex from '../controllers/viewLocations/viewLocationsIndex'
import populatePrisonId from '../middleware/populatePrisonId'
import populateResidentialSummary from '../middleware/populateResidentialSummary'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import viewLocationsShow from '../controllers/viewLocations/viewLocationsShow'
import validateCaseload from '../middleware/validateCaseload'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/',
    populateResidentialSummary(services),
    logPageView(services.auditService, Page.LOCATIONS_INDEX),
    viewLocationsIndex,
  )

  router.get(
    '/:locationId',
    populateResidentialSummary(services),
    logPageView(services.auditService, Page.LOCATIONS_SHOW),
    viewLocationsShow,
  )

  return router
}

export default controller
