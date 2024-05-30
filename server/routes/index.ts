import { Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import populateCards from '../middleware/populateCards'
import viewLocationsRouter from './viewLocationsRouter'
import addBreadcrumb from '../middleware/addBreadcrumb'
import logPageView from '../middleware/logPageView'

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

  router.use('/view-and-update-locations/:prisonId?', viewLocationsRouter(services))

  return router
}
