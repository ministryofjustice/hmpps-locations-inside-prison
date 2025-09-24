import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../middleware/protectRoute'
import populatePrisonConfiguration from '../../../middleware/populatePrisonConfiguration'

const router = express.Router({ mergeParams: true })

router.use(
  populatePrisonConfiguration(),
  protectRoute('administer_residential'),
  wizard(steps, fields, {
    name: 'change-include-seg-in-roll-count',
    templatePath: 'pages/admin/segInRollCount',
    csrf: false,
  }),
)

export default router
