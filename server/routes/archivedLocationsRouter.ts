import express from 'express'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import addBreadcrumb from '../middleware/addBreadcrumb'
import archivedLocationsIndex from '../controllers/archivedLocationsIndex'
import populateArchivedLocations from '../middleware/populateArchivedLocations'
import redirectToAddPrisonId from '../middleware/redirectToAddPrisonId'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonAndLocationId)
  router.use(redirectToAddPrisonId)
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
