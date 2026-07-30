import express from 'express'
import type { Services } from '../services'
import inactiveCellsRouter from './inactiveCellsRouter'
import createLocationRouter from './createLocation'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import reactivateCellsRouter from './reactivate/cells'
import viewLocations from '../controllers/viewLocations'

const optionalLocationRouter = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.use(populatePrisonAndLocationId)

  router.use('/create', createLocationRouter)
  router.use('/inactive-cells', inactiveCellsRouter(services))
  router.use('/reactivate/cells', reactivateCellsRouter)
  router.use('/view', viewLocations)

  return router
}

export default optionalLocationRouter
