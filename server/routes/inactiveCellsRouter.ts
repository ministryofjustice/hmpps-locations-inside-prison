import express from 'express'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import populateInactiveCells from '../middleware/populateInactiveCells'
import inactiveCellsIndex from '../controllers/inactiveCellsIndex'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'
import populateDecoratedResidentialSummary from '../middleware/populateDecoratedResidentialSummary'
import asyncMiddleware from '../middleware/asyncMiddleware'
import redirectToAddPrisonId from '../middleware/redirectToAddPrisonId'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonAndLocationId)
  router.use(redirectToAddPrisonId)
  router.use(validateCaseload())

  router.get(
    '/:locationId?',
    asyncMiddleware(async (req, res, next) => {
      res.locals.options = { action: '/reactivate/cells', method: 'get' }
      if (req.params.locationId) {
        res.locals.locationId = req.params.locationId
        await populateDecoratedResidentialSummary(req, res, next)
        return
      }

      next()
    }),
    populateBreadcrumbsForLocation,
    addBreadcrumb({ title: '', href: '/' }),
    populateInactiveCells(services),
    logPageView(services.auditService, Page.INACTIVE_CELLS),
    inactiveCellsIndex,
  )

  return router
}

export default controller
