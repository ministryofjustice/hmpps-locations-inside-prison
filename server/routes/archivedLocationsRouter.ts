import express from 'express'
import type { Services } from '../services'
import addBreadcrumb from '../middleware/addBreadcrumb'
import archivedLocationsIndex from '../controllers/archivedLocationsIndex'
import populateArchivedLocations from '../middleware/populateArchivedLocations'

const controller = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.get('/', addBreadcrumb({ title: '', href: '/' }), populateArchivedLocations(services), archivedLocationsIndex)

  return router
}

export default controller
