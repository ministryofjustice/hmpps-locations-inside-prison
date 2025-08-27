import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import protectRoute from '../../middleware/protectRoute'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('create_location'),
  populatePrisonAndLocationId,
  populateDecoratedResidentialSummary,
  wizard(steps, null, {
    name: 'delete-draft-location',
    templatePath: 'pages/deleteDraftLocation',
    csrf: false,
  }),
)

export default router
