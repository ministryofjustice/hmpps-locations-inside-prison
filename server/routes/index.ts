import { Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import populateCards from '../middleware/populateCards'
import addBreadcrumb from '../middleware/addBreadcrumb'
import logPageView from '../middleware/logPageView'
import changeSignedOperationalCapacityRouter from './changeSignedOperationalCapacity'
import addServicesToRequest from '../middleware/addServicesToRequest'

import archivedLocationsRouter from './archivedLocationsRouter'
import cellConversionRouter from './cellConversion'
import changeCellCapacityRouter from './changeCellCapacity'
import deactivateTemporaryRouter from './deactivateTemporary'
import inactiveCellsRouter from './inactiveCellsRouter'
import nonResidentialConversionRouter from './nonResidentialConversion'
import reactivateRouter from './reactivate'
import removeCellTypeRouter from './removeCellType'
import setCellTypeRouter from './setCellType'
import viewLocationsRouter from './viewLocationsRouter'
import changeUsedForRouter from './changeUsedFor'
import locationHistoryRouter from './locationHistoryRouter'
import setLocalNameRouter from './setLocalName'
import changeLocalNameRouter from './changeLocalName'
import removeLocalNameRouter from './removeLocalName'

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

  router.use('/location-history', locationHistoryRouter(services))

  router.use('/reactivate', reactivateRouter)

  router.use('/location/:locationId/cell-conversion', cellConversionRouter)
  router.use('/location/:locationId/change-cell-capacity', changeCellCapacityRouter)
  router.use('/location/:locationId/deactivate/temporary', deactivateTemporaryRouter)
  router.use('/location/:locationId/non-residential-conversion', nonResidentialConversionRouter)
  router.use('/location/:locationId/change-used-for', changeUsedForRouter)
  router.use('/location/:locationId/remove-cell-type', removeCellTypeRouter)
  router.use('/location/:locationId/set-cell-type', setCellTypeRouter)
  router.use('/location/:locationId/add-local-name', setLocalNameRouter)
  router.use('/location/:locationId/change-local-name', changeLocalNameRouter)
  router.use('/location/:locationId/remove-local-name', removeLocalNameRouter)

  router.use('/change-signed-operational-capacity/:prisonId', changeSignedOperationalCapacityRouter)

  return router
}
