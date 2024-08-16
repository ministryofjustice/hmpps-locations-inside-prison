import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('convert_non_residential'),
  populateLocation(),
  populatePrisonersInLocation(),
  wizard(steps, fields, {
    name: 'non-residential-conversion',
    templatePath: 'pages/nonResidentialConversion',
    csrf: false,
  }),
)

export default router
