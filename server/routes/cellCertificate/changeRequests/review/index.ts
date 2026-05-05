import express, { NextFunction, Request, Response } from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../../../middleware/protectRoute'
import populateCertificationRequestDetails from '../../../../middleware/populateCertificationRequestDetails'

async function populatePrisonersForCapacityChange(req: Request, res: Response, next: NextFunction) {
  const { approvalRequest } = res.locals
  if (approvalRequest?.approvalType === 'CAPACITY_CHANGE' && approvalRequest.locationId) {
    const [prisonerLocation] = await req.services.locationsService.getPrisonersInLocation(
      req.session.systemToken,
      approvalRequest.locationId,
    )
    res.locals.prisonerLocation = prisonerLocation
  }
  next()
}

const router = express.Router({ mergeParams: true })

router.use(
  protectRoute('certificate_change_request_review'),
  populateCertificationRequestDetails,
  populatePrisonersForCapacityChange,
  wizard(steps, fields, {
    name: 'review-certificate-change-request',
    templatePath: 'pages/cellCertificate/changeRequests/review',
    csrf: false,
  }),
)

export default router
