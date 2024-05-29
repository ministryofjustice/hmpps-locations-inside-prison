import express from 'express'
import viewLocationsIndex from '../controllers/viewLocations/viewLocationsIndex'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populatePrisonId from '../middleware/populatePrisonId'
import populateResidentialSummary from '../middleware/populateResidentialSummary'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(addBreadcrumb({ title: 'View and update locations', href: '/view-and-update-locations' }))
  router.use(populatePrisonId())

  router.get(
    '/',
    populateResidentialSummary(services),
    logPageView(services.auditService, Page.VIEW_LOCATIONS),
    viewLocationsIndex,
  )

  return router
}

export default controller
