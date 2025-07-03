import express from 'express'
import populatePrisonId from '../middleware/populatePrisonId'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populatePrisonConfiguration from '../middleware/populatePrisonConfiguration'
import adminIndex from '../controllers/adminIndex'
import getServicePrisonsNonHousingDisplay from '../middleware/getServicePrisonsNonHousingDisplay'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/',
    addBreadcrumb({ title: '', href: '/' }),
    populatePrisonConfiguration(),
    getServicePrisonsNonHousingDisplay(),
    logPageView(services.auditService, Page.LOCATION_ADMIN),
    adminIndex,
  )

  return router
}

export default controller
