import FormWizard from 'hmpo-form-wizard'
import Withdraw from '../../../../controllers/cellCertificate/changeRequests/withdraw'
import paths from '../../../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    backLink: (_req, res) => paths.cellCertificate.changeRequest.view(res.locals.approvalRequest.prisonId),
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
