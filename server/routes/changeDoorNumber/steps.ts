import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeDoorNumber/details'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
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
    description: (_req, _res) => `changing cell door number`,
  }),
  '/details': {
    fields: ['doorNumber', 'explanation'],
    controller: Details,
    template: '../../partials/formStep',
    pageTitle: 'Change door number',
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
