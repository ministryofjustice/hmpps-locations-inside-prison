import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonConfiguration from '../../middleware/populatePrisonConfiguration'
import populateTitleCaptionFromLocation from '../../middleware/populateTitleCaptionFromLocation'
import getPendingApprovalsBelow from '../../middleware/getPendingApprovalsBelow'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('archive_location'),
  populateLocation({ decorate: true, includeCurrentCertificate: true }),
  populateTitleCaptionFromLocation,
  populatePrisonConfiguration(),
  getPendingApprovalsBelow,
  wizard(steps, fields, {
    name: 'archive',
    templatePath: 'pages/archiveLocation',
    csrf: false,
  }),
)

export default router
