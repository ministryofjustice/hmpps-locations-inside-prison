import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonId from '../../middleware/populatePrisonId'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_signed_operational_capacity'),
  populatePrisonId(),
  wizard(steps, fields, {
    name: 'change-signed-operational-capacity',
    templatePath: 'pages/changeSignedOperationalCapacity',
    csrf: false,
  }),
)

export default router
