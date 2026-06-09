import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../middleware/protectRoute'
import populatePrisonConfiguration from '../../../middleware/populatePrisonConfiguration'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import ingestList from '../../../controllers/admin/ingest/list'
import ingestDetail from '../../../controllers/admin/ingest/detail'

const router = express.Router({ mergeParams: true })

router.use(populatePrisonConfiguration(), protectRoute('administer_residential'))

// Status of cell certificate uploads for the prison
router.get('/', asyncMiddleware(ingestList))

// Drill into a single upload
router.get('/upload/:uploadId', asyncMiddleware(ingestDetail))

// Upload a new cell certificate (CSV upload -> confirm -> submit)
router.use(
  '/new',
  wizard(steps, fields, {
    name: 'ingest-cert',
    templatePath: 'pages/admin/ingest',
    csrf: false,
  }),
)

export default router
