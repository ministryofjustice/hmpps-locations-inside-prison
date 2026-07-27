import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeDoorNumber/details'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedResidentialSummary.location),
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: (_req, res) => res.locals.decoratedResidentialSummary.location.status !== 'DRAFT',
        next: 'cert-change-disclaimer',
      },
      'details',
    ],
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'details',
    title: (_req, _res) => `Changing cell door number`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedResidentialSummary.location.displayName)}`,
  }),
  '/details': {
    fields: ['doorNumber', 'explanation'],
    controller: Details,
    template: '../../partials/formStep',
    pageTitle: 'Change door number',
    editable: true,
    editBackStep: 'submit-certification-approval-request',
    next: [
      {
        fn: (_req, res) => res.locals.decoratedResidentialSummary.location.status !== 'DRAFT',
        next: 'submit-certification-approval-request',
      },
      '#',
    ],
  },
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
