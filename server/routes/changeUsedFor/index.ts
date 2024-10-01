import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_used_for'),
  populateLocation(true),
  wizard(steps, fields, {
    name: 'change-used-for',
    templatePath: 'pages/changeUsedFor',
    csrf: false,
  }),
)

export default router
