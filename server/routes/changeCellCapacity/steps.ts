import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeCellCapacity from '../../controllers/changeCellCapacity'
import ConfirmCellCapacity from '../../controllers/changeCellCapacity/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'

function isCertActiveAndNotDraft(_req: FormWizard.Request, res: Response): boolean {
  const { prisonConfiguration, decoratedLocation } = res.locals
  return prisonConfiguration.certificationApprovalRequired === 'ACTIVE' && decoratedLocation.status !== 'DRAFT'
}

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
        fn: (req, res) => isCertActiveAndNotDraft(req, res) && !req.sessionModel.get('onlyWorkingCapChanged'),
        next: 'cert-change-disclaimer',
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
