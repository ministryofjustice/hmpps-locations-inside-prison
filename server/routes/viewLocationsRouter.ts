import express from 'express'
import viewLocationsIndex from '../controllers/viewLocations/viewLocationsIndex'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import populateDecoratedResidentialSummary from '../middleware/populateDecoratedResidentialSummary'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import viewLocationsShow from '../controllers/viewLocations/viewLocationsShow'
import validateCaseload from '../middleware/validateCaseload'
import populateBreadcrumbsForLocation from '../middleware/populateBreadcrumbsForLocation'
import asyncMiddleware from '../middleware/asyncMiddleware'
import addAction from '../middleware/addAction'
import addBreadcrumb from '../middleware/addBreadcrumb'
import populateTopLevelDraftLocationSummary from '../middleware/populateTopLevelDraftLocationSummary'
import redirectToAddPrisonId from '../middleware/redirectToAddPrisonId'
import setCanAccess from '../middleware/setCanAccess'

const router = express.Router({ mergeParams: true })

export const addActions = asyncMiddleware(async (req, res, next) => {
  const { location } = res.locals.decoratedResidentialSummary
  const { active, isResidential, leafLevel, raw, status } = location
  const { locationType } = raw

  if (
    active &&
    isResidential &&
    ['CELL', 'LANDING', 'WING', 'SPUR'].includes(locationType) &&
    req.canAccess('deactivate')
  ) {
    addAction({
      text: `Deactivate ${location.locationType.toLowerCase()}`,
      href: `/location/${location.id}/deactivate`,
    })(req, res, null)
  } else if (!active && status === 'DRAFT' && req.canAccess('create_location')) {
    addAction({
      text: `Delete ${location.locationType.toLowerCase()}`,
      href: `/delete-draft/${location.id}`,
      class: 'govuk-button--warning',
    })(req, res, null)
  }

  if (req.canAccess('convert_non_residential') && active && isResidential && leafLevel) {
    addAction({
      text: `Convert cell to non-residential room`,
      href: `/location/${location.id}/non-residential-conversion`,
    })(req, res, null)
  }

  next()
})

const controller = (services: Services) => {
  router.use(populatePrisonAndLocationId)
  router.use(redirectToAddPrisonId)
  router.use(validateCaseload())
  // set can access here
  router.use(setCanAccess(services.locationsService))

  router.get(
    '/',
    populateDecoratedResidentialSummary,
    populateBreadcrumbsForLocation,
    addBreadcrumb({ title: '', href: '/' }),
    logPageView(services.auditService, Page.LOCATIONS_INDEX),
    viewLocationsIndex,
  )

  router.get(
    '/:locationId',
    populateDecoratedResidentialSummary,
    populateTopLevelDraftLocationSummary,
    populateBreadcrumbsForLocation,
    logPageView(services.auditService, Page.LOCATIONS_SHOW),
    addActions,
    viewLocationsShow,
  )

  return router
}

export default controller
