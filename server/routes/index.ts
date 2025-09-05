import { Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import populateCards from '../middleware/populateCards'
import viewLocationsRouter from './viewLocationsRouter'
import changeTemporaryDeactivationDetailsRouter from './changeTemporaryDeactivationDetails'
import addBreadcrumb from '../middleware/addBreadcrumb'
import logPageView from '../middleware/logPageView'
import addServicesToRequest from '../middleware/addServicesToRequest'
import { dprRouter } from './dpr'

import archivedLocationsRouter from './archivedLocationsRouter'
import cellConversionRouter from './cellConversion'
import changeCellCapacityRouter from './changeCellCapacity'
import changeSignedOperationalCapacityRouter from './changeSignedOperationalCapacity'
import deactivateRouter from './deactivate'
import inactiveCellsRouter from './inactiveCellsRouter'
import nonResidentialConversionRouter from './nonResidentialConversion'
import reactivateRouter from './reactivate'
import removeCellTypeRouter from './removeCellType'
import setCellTypeRouter from './setCellType'
import changeNonResidentialTypeRouter from './changeNonResidentialType'
import changeUsedForRouter from './changeUsedFor'
import changeLocationCodeRouter from './changeLocationCode'
import locationHistoryRouter from './locationHistoryRouter'
import setLocalNameRouter from './setLocalName'
import changeLocalNameRouter from './changeLocalName'
import removeLocalNameRouter from './removeLocalName'
import createLocationRouter from './createLocation'
import deleteDraftLocationRouter from './deleteDraftLocation'
import adminRouter from './adminRouter'
import changeResiStatusRouter from './admin/resi'
import changeCertApprovalStatusRouter from './admin/certApproval'
import ingestRouter from './admin/ingest'

export default function routes(services: Services): Router {
  const router = Router()

  router.use(addBreadcrumb({ title: 'Residential locations', href: '/' }))
  router.get(
    '/',
    populateCards(services.locationsService),
    logPageView(services.auditService, Page.INDEX),
    asyncMiddleware(async (req, res) => {
      res.render('pages/index')
    }),
  )

  router.use(addServicesToRequest(services))

  router.use('/archived-locations/:prisonId?', archivedLocationsRouter(services))
  router.use('/inactive-cells/:prisonId?', inactiveCellsRouter(services))
  router.use('/create-new/:prisonOrLocationId', createLocationRouter)
  router.use('/delete-draft/:prisonOrLocationId', deleteDraftLocationRouter)

  router.use('/view-and-update-locations/:prisonId?', viewLocationsRouter(services))

  router.use('/location-history', locationHistoryRouter(services))

  router.use('/reactivate', reactivateRouter)

  router.use('/location/:locationId/cell-conversion', cellConversionRouter)
  router.use('/location/:locationId/change-cell-capacity', changeCellCapacityRouter)
  router.use('/location/:locationId/deactivate', deactivateRouter)
  router.use('/location/:locationId/non-residential-conversion', nonResidentialConversionRouter)
  router.use('/location/:locationId/change-used-for', changeUsedForRouter)
  router.use('/location/:locationId/change-location-code', changeLocationCodeRouter)
  router.use('/location/:locationId/remove-cell-type', removeCellTypeRouter)
  router.use('/location/:locationId/set-cell-type', setCellTypeRouter)
  router.use('/location/:locationId/add-local-name', setLocalNameRouter)
  router.use('/location/:locationId/change-local-name', changeLocalNameRouter)
  router.use('/location/:locationId/remove-local-name', removeLocalNameRouter)
  router.use('/location/:locationId/change-temporary-deactivation-details', changeTemporaryDeactivationDetailsRouter)

  router.use('/change-signed-operational-capacity/:prisonId', changeSignedOperationalCapacityRouter)
  router.use('/location/:locationId/change-non-residential-type', changeNonResidentialTypeRouter)

  // Digital Prison Reporting
  dprRouter(router, services)

  // admin
  router.use('/admin/:prisonId?', adminRouter(services))
  router.use('/admin/:prisonId/change-resi-status', changeResiStatusRouter)
  router.use('/admin/:prisonId/change-certification-status', changeCertApprovalStatusRouter)
  router.use('/admin/:prisonId/ingest-cert', ingestRouter)

  return router
}
