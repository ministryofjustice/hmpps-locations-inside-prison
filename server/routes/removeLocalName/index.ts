import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateLocation from '../../middleware/populateLocation'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_local_name'),
  populateLocation({ decorate: true }),
  wizard(steps, fields, {
    name: 'remove-local-name',
    templatePath: 'pages/removeLocalName',
    csrf: false,
  }),
)

export default router