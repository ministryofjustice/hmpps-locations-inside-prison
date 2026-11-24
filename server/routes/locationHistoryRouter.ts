import express from 'express'
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
    locationHistoryShow(services),
  )

  return router
}

export default controller
