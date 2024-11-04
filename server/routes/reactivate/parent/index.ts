import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../middleware/protectRoute'
import populateLocation from '../../../middleware/populateLocation'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('reactivate'),
  populateLocation({ decorate: true }),
  wizard(steps, fields, {
    name: 'reactivate-parent',
    templatePath: 'pages/reactivate/parent',
    csrf: false,
  }),
)

export default router
