import FormWizard from 'hmpo-form-wizard'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import AddToCertificateInit from '../../controllers/addToCertificate/addToCertificateInit'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
    controller: AddToCertificateInit,
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
