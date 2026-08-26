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

  // Every residential role can see what has been uploaded and how it turned out.
  router.use(protectRoute('cell_certificate_upload_view'))

  // Status of cell certificate uploads for the prison
  router.get('/', logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOADS), asyncMiddleware(uploadList))

  // Drill into a single upload
  router.get(
    '/upload/:uploadId',
    logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOAD_DETAIL),
    asyncMiddleware(uploadDetail),
  )

  // Starting an upload changes the prison's data, so it stays restricted to the roles that may run one.
  router.use(
    '/new',
    protectRoute('cell_certificate_upload_create'),
    wizard(steps, fields, {
      name: 'ingest-cert',
      templatePath: 'pages/cellCertificateUploads',
      csrf: false,
    }),
  )

  return router
}
