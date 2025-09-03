import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_location_code'),
  populatePrisonAndLocationId,
  populateDecoratedResidentialSummary,
  wizard(steps, fields, {
    name: 'change-location-code',
    templatePath: 'pages/changeLocationCode',
    csrf: false,
  }),
)

export default router
