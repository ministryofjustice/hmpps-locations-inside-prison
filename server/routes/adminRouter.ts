import express from 'express'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populatePrisonConfiguration from '../middleware/populatePrisonConfiguration'
import adminIndex from '../controllers/adminIndex'
import getServicePrisonsNonHousingDisplay, {
  getSplashScreenStatus,
} from '../middleware/getServicePrisonsNonHousingDisplay'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import redirectToAddPrisonId from '../middleware/redirectToAddPrisonId'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonAndLocationId)
  router.use(redirectToAddPrisonId)
  router.use(validateCaseload())

  router.get(
    '/',
    addBreadcrumb({ title: '', href: '/' }),
    populatePrisonConfiguration(),
    getServicePrisonsNonHousingDisplay(),
    getSplashScreenStatus(),
    logPageView(services.auditService, Page.LOCATION_ADMIN),
    adminIndex,
  )

  return router
}

export default controller
