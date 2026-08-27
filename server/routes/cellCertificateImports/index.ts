import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import importList from '../../controllers/cellCertificateImports/list'
import importDetail from '../../controllers/cellCertificateImports/detail'
import logPageView from '../../middleware/logPageView'
import { Services } from '../../services'
import { Page } from '../../services/auditService'

export default function routes(services: Services): express.Router {
  const router = express.Router({ mergeParams: true })

  // Reaching these pages means being able to run an import; the results are surfaced to a wider
  // audience on the cell certificate import request details page instead.
  router.use(protectRoute('cell_certificate_import'))

  // Status of cell certificate imports for the prison. The audit page names still say UPLOAD so that
  // this journey's page views stay under one name in the audit service - see auditService.ts.
  router.get('/', logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOADS), asyncMiddleware(importList))

  // Drill into a single import
  router.get(
    '/import/:importId',
    logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOAD_DETAIL),
    asyncMiddleware(importDetail),
  )

  router.use(
    '/new',
    wizard(steps, fields, {
      name: 'cell-certificate-import',
      templatePath: 'pages/cellCertificateImports',
      csrf: false,
    }),
  )

  return router
}
