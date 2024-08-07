import { Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import populateCards from '../middleware/populateCards'
import viewLocationsRouter from './viewLocationsRouter'
import addBreadcrumb from '../middleware/addBreadcrumb'
import logPageView from '../middleware/logPageView'
import inactiveCellsRouter from './inactiveCellsRouter'
import archivedLocationsRouter from './archivedLocationsRouter'
import changeCellCapacityRouter from './changeCellCapacity'
import changeSignedOperationalCapacityRouter from './changeSignedOperationalCapacity'
import setCellTypeRouter from './setCellType'
import removeCellTypeRouter from './removeCellType'
import addServicesToRequest from '../middleware/addServicesToRequest'

export default function routes(services: Services): Router {
  const router = Router()

  router.use(addBreadcrumb({ title: 'Residential locations', href: '/' }))
  router.get(
    '/',
    populateCards(),
    logPageView(services.auditService, Page.INDEX),
    asyncMiddleware(async (req, res) => {
      res.render('pages/index')
    }),
  )

  router.use(addServicesToRequest(services))

  router.use('/archived-locations/:prisonId?', archivedLocationsRouter(services))
  router.use('/inactive-cells/:prisonId?', inactiveCellsRouter(services))

  router.use('/view-and-update-locations/:prisonId?', viewLocationsRouter(services))

  router.use('/location/:cellId/change-cell-capacity', changeCellCapacityRouter)

  router.use('/location/:cellId/set-cell-type', setCellTypeRouter)

  router.use('/location/:cellId/remove-cell-type', removeCellTypeRouter)

  router.use('/change-signed-operational-capacity/:prisonId', changeSignedOperationalCapacityRouter)

  return router
}
