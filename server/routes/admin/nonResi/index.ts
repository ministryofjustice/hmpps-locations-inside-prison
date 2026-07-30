import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../middleware/protectRoute'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('administer_residential'),
  wizard(steps, fields, {
    name: 'change-non-resi-status',
    templatePath: 'pages/admin',
    csrf: false,
  }),
)

export default router
