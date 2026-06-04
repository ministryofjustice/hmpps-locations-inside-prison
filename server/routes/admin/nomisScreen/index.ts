import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateModuleName from './populateModuleName'
import protectRoute from '../../../middleware/protectRoute'
import populatePrisonConfiguration from '../../../middleware/populatePrisonConfiguration'

const router = express.Router({ mergeParams: true })

router.use(
  populateModuleName,
  populatePrisonConfiguration(),
  protectRoute('administer_residential'),
  wizard(steps, fields, {
    name: 'change-nomis-screen-status',
    templatePath: 'pages/admin/nomisScreen',
    csrf: false,
  }),
)

export default router
