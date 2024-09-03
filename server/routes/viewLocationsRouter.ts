import express from 'express'
import viewLocationsIndex from '../controllers/viewLocations/viewLocationsIndex'
import populatePrisonId from '../middleware/populatePrisonId'
import populateResidentialSummary from '../middleware/populateResidentialSummary'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import viewLocationsShow from '../controllers/viewLocations/viewLocationsShow'
import validateCaseload from '../middleware/validateCaseload'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'
import asyncMiddleware from '../middleware/asyncMiddleware'
import addAction from '../middleware/addAction'
import { DecoratedLocation } from '../decorators/decoratedLocation'

const router = express.Router({ mergeParams: true })

export const addActions = asyncMiddleware(async (req, res, next) => {
  const { location }: { location: DecoratedLocation } = res.locals.residentialSummary

  const { active, isResidential, leafLevel, raw } = location
  const { locationType } = raw
  if (req.canAccess('convert_non_residential') && active && isResidential && leafLevel) {
    addAction({
      text: `Convert to non-residential room`,
      href: `/location/${location.id}/non-residential-conversion`,
    })(req, res, null)
  }

  if (active && locationType === 'CELL' && req.canAccess('deactivate_temporary')) {
    addAction({
      text: 'Deactivate cell',
      href: `/location/${location.id}/deactivate/temporary`,
    })(req, res, null)
  }

  next()
})

const controller = (services: Services) => {
  router.use(populatePrisonId())
  router.use(validateCaseload())

  router.get(
    '/',
    populateResidentialSummary(services),
    populateBreadcrumbsForLocation,
    logPageView(services.auditService, Page.LOCATIONS_INDEX),
    viewLocationsIndex,
  )

  router.get(
    '/:locationId',
    populateResidentialSummary(services),
    populateBreadcrumbsForLocation,
    logPageView(services.auditService, Page.LOCATIONS_SHOW),
    addActions,
    viewLocationsShow,
  )

  return router
}

export default controller
