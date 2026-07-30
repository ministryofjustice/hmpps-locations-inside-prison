import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('create_location'),
  populateDecoratedResidentialSummary,
  wizard(steps, fields, {
    name: 'create-cells',
    templatePath: 'pages/createCells',
    csrf: false,
  }),
)

export default router
