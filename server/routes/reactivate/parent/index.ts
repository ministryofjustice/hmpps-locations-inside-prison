import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../middleware/protectRoute'
import populateLocation from '../../../middleware/populateLocation'
import populateTitleCaptionFromLocationOrPrison from '../../../middleware/populateTitleCaptionFromLocationOrPrison'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('reactivate'),
  populateLocation({ decorate: true }),
  populateTitleCaptionFromLocationOrPrison,
  wizard(steps, fields, {
    name: 'reactivate-parent',
    templatePath: 'pages/reactivate/parent',
    csrf: false,
  }),
)

export default router
