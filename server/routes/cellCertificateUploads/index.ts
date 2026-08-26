import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import uploadList from '../../controllers/cellCertificateUploads/list'
import uploadDetail from '../../controllers/cellCertificateUploads/detail'
import logPageView from '../../middleware/logPageView'
import { Services } from '../../services'
import { Page } from '../../services/auditService'

export default function routes(services: Services): express.Router {
  const router = express.Router({ mergeParams: true })

  // Reaching these pages means being able to run an ingestion; the results are surfaced to a wider
  // audience on the cell certificate import request details page instead.
  router.use(protectRoute('cell_certificate_upload'))

  // Status of cell certificate uploads for the prison
  router.get('/', logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOADS), asyncMiddleware(uploadList))

  // Drill into a single upload
  router.get(
    '/upload/:uploadId',
    logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOAD_DETAIL),
    asyncMiddleware(uploadDetail),
  )

  router.use(
    '/new',
    wizard(steps, fields, {
      name: 'ingest-cert',
      templatePath: 'pages/cellCertificateUploads',
      csrf: false,
    }),
  )

  return router
}
