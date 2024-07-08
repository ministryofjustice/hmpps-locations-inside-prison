import express from 'express'
import populatePrisonId from '../middleware/populatePrisonId'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import addBreadcrumb from '../middleware/addBreadcrumb'
import archivedLocationsIndex from '../controllers/archivedLocationsIndex'
import populateArchivedLocations from '../middleware/populateArchivedLocations'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/',
    addBreadcrumb({ title: '', href: '/' }),
    populateArchivedLocations(services),
    logPageView(services.auditService, Page.ARCHIVED_LOCATIONS),
    archivedLocationsIndex,
  )

  return router
}

export default controller
