import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'
import populateTitleCaptionFromLocationOrPrison from '../../middleware/populateTitleCaptionFromLocationOrPrison'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('change_sanitation'),
  populateDecoratedResidentialSummary,
  populateTitleCaptionFromLocationOrPrison,
  wizard(steps, fields, {
    name: 'change-sanitation',
    templatePath: 'pages/changeSanitation',
    csrf: false,
  }),
)

export default router
