import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../middleware/protectRoute'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('reactivate'),
  wizard(steps, fields, {
    name: 'reactivate-cells',
    templatePath: 'pages/reactivate/cells',
    csrf: false,
  }),
)

export default router
