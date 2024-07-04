import express from 'express'
import populatePrisonId from '../middleware/populatePrisonId'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import validateCaseload from '../middleware/validateCaseload'
import populateInactiveCells from '../middleware/populateInactiveCells'
import inactiveCellsIndex from '../controllers/inactiveCellsIndex'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'
import populateResidentialSummary from '../middleware/populateResidentialSummary'
import asyncMiddleware from '../middleware/asyncMiddleware'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/:locationId?',
    asyncMiddleware(async (req, res, next) => {
      if (req.params.locationId) {
        await populateResidentialSummary(services)(req, res, next)
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
