import express from 'express'
import type { Services } from '../services'
import populateInactiveCells from '../middleware/populateInactiveCells'
import inactiveCellsIndex from '../controllers/inactiveCellsIndex'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'
import populateDecoratedResidentialSummary from '../middleware/populateDecoratedResidentialSummary'
import asyncMiddleware from '../middleware/asyncMiddleware'
import paths from '../utils/paths'

const controller = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.get(
    '/',
    asyncMiddleware(async (req, res, next) => {
      const { prisonId, locationId } = res.locals

      if (locationId) {
        await populateDecoratedResidentialSummary(req, res)
      }
      res.locals.options = { action: paths.location.reactivate.cells(prisonId, locationId), method: 'get' }

      next()
    }),
    populateBreadcrumbsForLocation,
    addBreadcrumb({ title: '', href: '/' }),
    populateInactiveCells(services),
    inactiveCellsIndex,
  )

  return router
}

export default controller
