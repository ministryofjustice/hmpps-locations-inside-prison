import FormWizard from 'hmpo-form-wizard'
import ChangeSignedOperationalCapacity from '../../controllers/changeSignedOperationalCapacity'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'update-signed-op-cap/is-under-review',
      },
      'change',
    ],
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
  '/change': {
    fields: ['newSignedOperationalCapacity', 'prisonGovernorApproval'],
    controller: ChangeSignedOperationalCapacity,
  },
}

export default steps
