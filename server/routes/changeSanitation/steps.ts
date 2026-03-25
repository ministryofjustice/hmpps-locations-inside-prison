import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeSanitation/details'
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
    title: (_req, _res) => `Changing cell sanitation`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedResidentialSummary.location.displayName)}`,
  }),
  '/details': {
    fields: ['inCellSanitation', 'explanation'],
    controller: Details,
    template: '../../partials/formStep',
    pageTitle: 'Does the cell have in-cell sanitation?',
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
