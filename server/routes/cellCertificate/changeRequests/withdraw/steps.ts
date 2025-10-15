import FormWizard from 'hmpo-form-wizard'
import Withdraw from '../../../../controllers/cellCertificate/changeRequests/withdraw'

const steps: FormWizard.Steps = {
  '/': {
    backLink: (_req, res) => `/${res.locals.approvalRequest.prisonId}/cell-certificate/change-requests`,
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'withdraw',
  },
  '/withdraw': {
    pageTitle: 'Withdraw change request',
    fields: ['explanation'],
    controller: Withdraw,
  },
}

export default steps
