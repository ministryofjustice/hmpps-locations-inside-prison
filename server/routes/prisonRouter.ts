import express from 'express'
import addRootBreadcrumb from '../middleware/addRootBreadcrumb'
import logPageView from '../middleware/logPageView'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import redirectToAddPrisonId from '../middleware/redirectToAddPrisonId'
import setCanAccess from '../middleware/setCanAccess'
import populateCards from '../middleware/populateCards'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import populatePrisonConfiguration from '../middleware/populatePrisonConfiguration'

import adminRouter from './adminRouter'
import cellCertificateRouter from './cellCertificate'
import changeSignedOperationalCapacityRouter from './changeSignedOperationalCapacity'
import locationRouter from './locationRouter'
import optionalLocationRouter from './optionalLocationRouter'
import archivedLocationsRouter from './archivedLocationsRouter'

const controller = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.use(
    populatePrisonAndLocationId,
    redirectToAddPrisonId,
    validateCaseload,
    populatePrisonConfiguration,
    setCanAccess,
    addRootBreadcrumb,
  )

  router.get(
    '/',
    populateCards,
    logPageView(services.auditService, Page.INDEX),
    asyncMiddleware(async (req, res) => {
      const success = req.flash('success')
      if (success?.length) {
        res.locals.banner = {
          success: success[0],
        }
      }

      const { user, prisonId } = res.locals
      if (req.canAccess('certificate_view_management') || user.activeCaseload.id !== prisonId) {
        res.locals.titleCaption = user.caseloads.find(c => c.id === prisonId).name
      }

      res.render('pages/index')
    }),
  )

  router.use('/admin', adminRouter(services))
  router.use('/archived-locations', archivedLocationsRouter(services))
  router.use('/cell-certificate', cellCertificateRouter)
  router.use('/change-signed-operational-capacity', changeSignedOperationalCapacityRouter)

  router.use('/', optionalLocationRouter(services))
  router.use('/:locationId', optionalLocationRouter(services))
  router.use('/:locationId', locationRouter(services))

  return router
}

export default controller
