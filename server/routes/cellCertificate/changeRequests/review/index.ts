import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../../middleware/protectRoute'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('certificate_change_request_review'),
  populateCertificationRequestDetails,
  wizard(steps, fields, {
    name: 'review-certificate-change-request',
    templatePath: 'pages/cellCertificate/changeRequests/review',
    csrf: false,
  }),
)

export default router
