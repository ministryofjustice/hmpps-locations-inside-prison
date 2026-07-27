import express from 'express'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import addBreadcrumb from '../middleware/addBreadcrumb'
import archivedLocationsIndex from '../controllers/archivedLocationsIndex'
import populateArchivedLocations from '../middleware/populateArchivedLocations'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
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
