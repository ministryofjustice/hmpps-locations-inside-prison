import express from 'express'
import changeRequestsIndex from '../../controllers/cellCertificate/changeRequests'
import changeRequestsShow from '../../controllers/cellCertificate/changeRequests/show'
import changeRequestsReview from './changeRequests/review'
import changeRequestsWithdraw from './changeRequests/withdraw'
import history from '../../controllers/cellCertificate/history'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import certificateShow from '../../controllers/cellCertificate/show'
import current from '../../controllers/cellCertificate/current'
import populateApprovalRequest from '../../middleware/populateApprovalRequest'
import addBreadcrumb from '../../middleware/addBreadcrumb'
import redirectNonPendingRequest from '../../middleware/redirectNonPendingRequest'
import redirectCurrentCertificate from '../../middleware/redirectCurrentCertificate'
import addConstantToLocals from '../../middleware/addConstantToLocals'

const router = express.Router({ mergeParams: true })

router.use(getPrisonResidentialSummary)
router.use(addConstantToLocals(['accommodationTypes', 'convertedCellTypes', 'specialistCellTypes', 'usedForTypes']))

router.use('/current', addBreadcrumb({ title: '', href: '/' }), current)
router.use(
  '/change-requests/:approvalRequestId/review',
  redirectNonPendingRequest,
  populateApprovalRequest,
  changeRequestsReview,
)
router.use(
  '/change-requests/:approvalRequestId/withdraw',
  redirectNonPendingRequest,
  populateApprovalRequest,
  changeRequestsWithdraw,
)
router.use('/change-requests/:approvalRequestId', populateApprovalRequest, changeRequestsShow)
router.use('/change-requests', addBreadcrumb({ title: '', href: '/' }), changeRequestsIndex)
router.use('/history', history)

router.use('/:certificateId', redirectCurrentCertificate, certificateShow)

export default router
