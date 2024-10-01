import express from 'express'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import locationHistoryShow from '../controllers/locationHistoryShow'
import populateLocation from '../middleware/populateLocation'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.get(
    '/:locationId',
    populateLocation({ includeHistory: true }),
    logPageView(services.auditService, Page.LOCATION_HISTORY),
    locationHistoryShow(services),
  )

  return router
}

export default controller
