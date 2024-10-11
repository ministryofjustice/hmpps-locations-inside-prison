import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_non_residential_type'),
  populateLocation({ decorate: true }),
  populatePrisonersInLocation(),
  wizard(steps, fields, {
    name: 'change-non-residential-type',
    templatePath: 'pages/changeNonResidentialType',
    csrf: false,
  }),
)

export default router
