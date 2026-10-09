import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import importList from '../../controllers/cellCertificateImports/list'
import importDetail from '../../controllers/cellCertificateImports/detail'
import continuePreview from '../../controllers/cellCertificateImports/continuePreview'
import logPageView from '../../middleware/logPageView'
import { Services } from '../../services'
import { Page } from '../../services/auditService'

export default function routes(services: Services): express.Router {
  const router = express.Router({ mergeParams: true })

  // A single import's report is open to anyone with the prison in their caseload, so the central team can share a
  // link with the prison to sort out the cells it shows (MAPA-428). The page hides what only those who can run an
  // import may do. The audit page names still say UPLOAD so that this journey's page views stay under one name in
  // the audit service - see auditService.ts.
  router.get(
    '/import/:importId',
    logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOAD_DETAIL),
    asyncMiddleware(importDetail),
  )

  // Everything else means being able to run an import
  router.use(protectRoute('cell_certificate_import'))

  // Status of cell certificate imports for the prison
  router.get('/', logPageView(services.auditService, Page.CELL_CERTIFICATE_UPLOADS), asyncMiddleware(importList))

  // Continue a finished preview as a real import - the only way to start one
  router.post('/import/:importId/continue', asyncMiddleware(continuePreview))

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
