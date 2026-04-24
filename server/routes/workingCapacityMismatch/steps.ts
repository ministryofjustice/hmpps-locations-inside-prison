import FormWizard from 'hmpo-form-wizard'
import DetailsController from '../../controllers/workingCapacityMismatch/details'
import ConfirmController from '../../controllers/workingCapacityMismatch/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    pageTitle: 'Cell’s working capacity does not match the cell certificate',
    fields: ['certifiedChange'],
    controller: DetailsController,
    next: [{ field: 'certifiedChange', value: 'YES', next: 'cert-change-disclaimer' }, 'confirm'],
  },
  '/confirm': {
    pageTitle: 'Confirm cell capacity',
    controller: ConfirmController,
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'update-signed-op-cap',
    title: (_req, _res) => `Changing the cell’s capacity`,
  }),
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
