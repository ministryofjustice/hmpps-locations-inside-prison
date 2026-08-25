import express from 'express'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import locationHistoryShow from '../controllers/locationHistoryShow'
import populateLocation from '../middleware/populateLocation'
import populateTitleCaptionFromLocationOrPrison from '../middleware/populateTitleCaptionFromLocationOrPrison'

const controller = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.get(
    '/',
    populateLocation({ includeHistory: true }),
    populateTitleCaptionFromLocationOrPrison,
    logPageView(services.auditService, Page.LOCATION_HISTORY),
    locationHistoryShow(services),
  )

  return router
}

export default controller
