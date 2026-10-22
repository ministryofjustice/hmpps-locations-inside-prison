import express from 'express'

import { NotFound } from 'http-errors'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import paths from '../utils/paths'
import asyncMiddleware from '../middleware/asyncMiddleware'
import redirectToAddPrisonId from '../middleware/redirectToAddPrisonId'
import { isValidUUID } from '../utils/isValidUUID'

const router = express.Router({ mergeParams: true })

const redirect = (redirectPathGetter: (req: Parameters<Parameters<typeof asyncMiddleware>[0]>[0]) => string) =>
  asyncMiddleware(async (req, res, next) => {
    const { params, services } = req
    const { locationsService } = services

    if (params.prisonOrLocationId) {
      if (isValidUUID(params.prisonOrLocationId as string)) {
        params.locationId = params.prisonOrLocationId
      } else {
        params.prisonId = params.prisonOrLocationId
      }
    }

    if (params.locationId && !params.prisonId) {
      const location = await locationsService.getLocation(req.session.systemToken, params.locationId as string)

      if (!req.user.caseloads.some(c => c.id === location.prisonId)) {
        next(NotFound())
        return
      }

      params.prisonId = location.prisonId
    }

    res.redirect(redirectPathGetter(req))
  })

router.use(
  '/admin/:prisonId/ingest-cert',
  redirect(req => paths.prison.cellCertificateImports(req.params.prisonId as string)),
)

// Cell certificate import moved out from under /admin when it stopped being admin-only. Staff who
// bookmarked it while it lived there land here.
router.use(
  '/:prisonId/admin/ingest-cert',
  redirect(req => paths.prison.cellCertificateImports(req.params.prisonId as string)),
)

// Renamed from "uploads" when the code caught up with the "import" wording. Unlike the redirects above
// this one carries the tail, because staff bookmark the report for an individual import.
router.use(
  '/:prisonId/cell-certificate-uploads',
  redirect(req => {
    const tail = req.url === '/' ? '' : req.url.replace(/^\/upload\//, '/import/')
    return `${paths.prison.cellCertificateImports(req.params.prisonId as string)}${tail}`
  }),
)

// The per-prison admin page and its change journeys were replaced by one national list of prisons (MAPA-467).
router.use(['/admin', '/:prisonId/admin'], (_req, res) => res.redirect(paths.prisonConfiguration.index))

router.use(
  '/archived-locations/:prisonId?',
  populatePrisonAndLocationId,
  redirectToAddPrisonId,
  redirect(req => paths.prison.archivedLocations(req.params.prisonId as string)),
)

router.use(
  '/change-signed-operational-capacity/:prisonId',
  redirect(req => paths.prison.changeSignedOperationalCapacity(req.params.prisonId as string)),
)

router.use(
  '/create-cells/:locationId',
  redirect(req => paths.location.createCells(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/create-new/:prisonOrLocationId',
  redirect(req => paths.location.create(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/delete-draft/:prisonOrLocationId',
  redirect(req => paths.location.delete(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/edit-cells/:locationId',
  redirect(req => paths.location.editCells(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/inactive-cells/:prisonId?/:locationId?',
  populatePrisonAndLocationId,
  redirectToAddPrisonId,
  redirect(req => paths.location.inactiveCells(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/add-local-name',
  redirect(req => paths.location.addLocalName(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/add-to-certificate',
  redirect(req => paths.location.addToCertificate(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/archive',
  redirect(req => paths.location.archive(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/cell-conversion',
  redirect(req => paths.location.cellConversion(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-cell-capacity',
  redirect(req => paths.location.changeCellCapacity(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-cell-type',
  redirect(req => paths.location.changeCellType(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-door-number',
  redirect(req => paths.location.changeDoorNumber(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-local-name',
  redirect(req => paths.location.changeLocalName(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-location-code',
  redirect(req => paths.location.changeLocationCode(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-non-residential-type',
  redirect(req =>
    paths.location.changeNonResidentialType(req.params.prisonId as string, req.params.locationId as string),
  ),
)

router.use(
  '/location/:locationId/change-sanitation',
  redirect(req => paths.location.changeSanitation(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/change-temporary-deactivation-details',
  redirect(req =>
    paths.location.changeTemporaryDeactivationDetails(req.params.prisonId as string, req.params.locationId as string),
  ),
)

router.use(
  '/location/:locationId/change-used-for',
  redirect(req => paths.location.changeUsedFor(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/deactivate',
  redirect(req => paths.location.deactivate(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/non-residential-conversion',
  redirect(req =>
    paths.location.nonResidentialConversion(req.params.prisonId as string, req.params.locationId as string),
  ),
)

router.use(
  '/location/:locationId/remove-cell-type',
  redirect(req => paths.location.removeCellType(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/remove-local-name',
  redirect(req => paths.location.removeLocalName(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/set-cell-type',
  redirect(req => paths.location.setCellType(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/location/:locationId/working-capacity-mismatch',
  redirect(req =>
    paths.location.workingCapacityMismatch(req.params.prisonId as string, req.params.locationId as string),
  ),
)

router.use(
  '/location-history/:locationId',
  redirect(req => paths.location.history(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/reactivate/cell/:locationId',
  redirect(req => paths.location.reactivate.cell(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/reactivate/cells/:prisonId?',
  populatePrisonAndLocationId,
  redirectToAddPrisonId,
  redirect(req => paths.location.reactivate.cells(req.params.prisonId as string)),
)

router.use(
  '/reactivate/location/:locationId',
  redirect(req => paths.location.reactivate.location(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/reactivate/parent/:locationId',
  redirect(req => paths.location.reactivate.parent(req.params.prisonId as string, req.params.locationId as string)),
)

router.use(
  '/view-and-update-locations/:prisonId?/:locationId?',
  populatePrisonAndLocationId,
  redirectToAddPrisonId,
  redirect(req => paths.location.view(req.params.prisonId as string, req.params.locationId as string)),
)

export default router
