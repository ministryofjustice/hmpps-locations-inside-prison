import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('set_cell_type'),
  populatePrisonAndLocationId,
  populateLocation({ decorate: true }),
  wizard(steps, fields, {
    name: 'set-cell-type',
    templatePath: 'pages/setCellType',
    csrf: false,
  }),
)

export default router
