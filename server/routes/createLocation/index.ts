import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateCreateLocation from '../../middleware/populateCreateLocation'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('create_location'),
  populateCreateLocation(),
  wizard(steps, fields, {
    name: 'create-location',
    templatePath: 'pages/createLocation',
    csrf: false,
  }),
)

export default router
