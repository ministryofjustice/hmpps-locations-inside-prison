import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populateTitleCaptionFromLocationOrPrison from '../../middleware/populateTitleCaptionFromLocationOrPrison'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_cell_capacity'),
  populateLocation({ decorate: false }),
  populateTitleCaptionFromLocationOrPrison,
  wizard(steps, fields, {
    name: 'working-capacity-mismatch',
    templatePath: 'pages/workingCapacityMismatch',
    csrf: false,
  }),
)

export default router
