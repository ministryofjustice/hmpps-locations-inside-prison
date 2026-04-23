import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'
import populateTitleCaptionFromLocation from '../../middleware/populateTitleCaptionFromLocation'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_cell_capacity'),
  populatePrisonAndLocationId,
  populateLocation({ decorate: false }),
  populateTitleCaptionFromLocation,
  wizard(steps, fields, {
    name: 'working-capacity-mismatch',
    templatePath: 'pages/workingCapacityMismatch',
    csrf: false,
  }),
)

export default router
