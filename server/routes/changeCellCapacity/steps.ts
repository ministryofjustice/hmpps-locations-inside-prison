import FormWizard from 'hmpo-form-wizard'
import ChangeCellCapacity from '../../controllers/changeCellCapacity'
import ConfirmCellCapacity from '../../controllers/changeCellCapacity/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import ShouldUpdateCert from '../../controllers/changeCellCapacity/shouldUpdateCert'
import isCertActiveAndNotDraft from '../../utils/isCertActiveAndNotDraft'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${res.locals.decoratedLocation.prisonId}/${res.locals.decoratedLocation.id}`,
    next: 'change',
  },
  '/change': {
    fields: ['baselineCna', 'workingCapacity', 'maxCapacity'],
    next: [
      {
        fn: (req, res) => isCertActiveAndNotDraft(res.locals) && !req.sessionModel.get('onlyWorkingCapChanged'),
        next: 'cert-change-disclaimer',
      },
      {
        fn: (_req, res) => isCertActiveAndNotDraft(res.locals),
        next: 'should-update-cert',
      },
      {
        fn: (_req, res) => res.locals.decoratedLocation.status === 'DRAFT',
        next: 'confirm-skip',
      },
      'confirm',
    ],
    controller: ChangeCellCapacity,
    pageTitle: 'Change cell capacity',
    template: '../../partials/formStep',
  },
  '/should-update-cert': {
    controller: ShouldUpdateCert,
    fields: ['updateCert'],
    next: [{ field: 'updateCert', value: 'YES', next: 'cert-change-disclaimer' }, 'confirm'],
    pageTitle: 'Do you also want to change the certified working capacity on the cell certificate?',
    template: '../../partials/formStep',
  },
  '/confirm': {
    controller: ConfirmCellCapacity,
    pageTitle: 'Confirm cell capacity',
  },
  '/confirm-skip': {
    controller: ConfirmCellCapacity,
    skip: true,
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'update-signed-op-cap',
    title: (_req, _res) => `Changing the cell's capacity`,
  }),
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
