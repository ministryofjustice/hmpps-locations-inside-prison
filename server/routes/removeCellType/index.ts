import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonConfiguration from '../../middleware/populatePrisonConfiguration'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('set_cell_type'),
  populateLocation(),
  populatePrisonConfiguration(),
  wizard(steps, fields, {
    name: 'remove-cell-type',
    templatePath: 'pages/removeCellType',
    csrf: false,
  }),
)

export default router
