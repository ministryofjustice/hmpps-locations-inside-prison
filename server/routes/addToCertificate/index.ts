import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('certificate_change_request_create'),
  populatePrisonAndLocationId,
  populateDecoratedResidentialSummary,
  wizard(steps, fields, {
    name: 'add-to-certificate',
    templatePath: 'pages/addToCertificate',
    csrf: false,
  }),
)

export default router
