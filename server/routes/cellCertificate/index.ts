import express from 'express'
import changeRequestsIndex from '../../controllers/cellCertificate/changeRequests'
import changeRequestsShow from '../../controllers/cellCertificate/changeRequests/show'
import changeRequestsReview from './changeRequests/review'
import changeRequestsWithdraw from './changeRequests/withdraw'
import history from '../../controllers/cellCertificate/history'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import certificateShow from '../../controllers/cellCertificate/show'
import current from '../../controllers/cellCertificate/current'
import redirectToPrependPrisonId from '../../middleware/redirectToPrependPrisonId'
import populateApprovalRequest from '../../middleware/populateApprovalRequest'
import populateConstants from '../../middleware/populateConstants'
import addBreadcrumb from '../../middleware/addBreadcrumb'
import redirectNonPendingRequest from '../../middleware/redirectNonPendingRequest'
import redirectCurrentCertificate from '../../middleware/redirectCurrentCertificate'

const router = express.Router({ mergeParams: true })

router.use(populatePrisonAndLocationId)
router.use(redirectToPrependPrisonId)
router.use(getPrisonResidentialSummary)

router.use('/current', addBreadcrumb({ title: '', href: '/' }), populateConstants, current)
router.use('/history', history)
router.use(
  '/change-requests/:approvalRequestId/review',
  redirectNonPendingRequest,
  populateConstants,
  populateApprovalRequest,
  changeRequestsReview,
)
router.use(
  '/change-requests/:approvalRequestId/withdraw',
  redirectNonPendingRequest,
  populateConstants,
  populateApprovalRequest,
  changeRequestsWithdraw,
)
router.use('/change-requests/:approvalRequestId', populateConstants, populateApprovalRequest, changeRequestsShow)
router.use('/change-requests', addBreadcrumb({ title: '', href: '/' }), changeRequestsIndex)
router.use('/:certificateId', redirectCurrentCertificate, populateConstants, certificateShow)

export default router
