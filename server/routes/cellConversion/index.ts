import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('convert_non_residential'),
  populateLocation(true),
  wizard(steps, fields, {
    name: 'cell-conversion',
    templatePath: 'pages/cellConversion',
    csrf: false,
  }),
)

export default router
