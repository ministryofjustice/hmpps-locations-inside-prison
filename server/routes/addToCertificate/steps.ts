import FormWizard from 'hmpo-form-wizard'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import FormStep from '../../controllers/base/formStep'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedResidentialSummary.location),
    reset: true,
    resetJourney: true,
    skip: true,
    controller: FormStep,
    next: 'cert-change-disclaimer',
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'update-signed-op-cap',
    title: (_req, _res) => `Adding new locations`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedResidentialSummary.location.displayName)}`,
  }),
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
