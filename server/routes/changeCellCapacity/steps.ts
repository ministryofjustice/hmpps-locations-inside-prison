import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeCellCapacity from '../../controllers/changeCellCapacity'
import ConfirmCellCapacity from '../../controllers/changeCellCapacity/confirm'
import ConfirmWorkingCapacity from '../../controllers/changeCellCapacity/confirmWorkingCapacity'
import CertChangeDetails from '../../controllers/changeCellCapacity/certChangeDetails'
import canEditCna from '../../utils/canEditCna'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import capFirst from '../../formatters/capFirst'

function isCertActiveAndNotDraft(_req: FormWizard.Request, res: Response): boolean {
  const { prisonConfiguration, decoratedLocation } = res.locals
  return prisonConfiguration?.certificationApprovalRequired === 'ACTIVE' && decoratedLocation?.status !== 'DRAFT'
}

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'change',
  },
  '/change': {
    fields: ['baselineCna', 'workingCapacity', 'maxCapacity'],
    next: [
      {
        // Cert active + not draft + CNA/maxCap changed → cert change disclaimer
        fn: (req, res) => isCertActiveAndNotDraft(req, res) && !!req.sessionModel.get('cnaOrMaxCapChanged'),
        next: 'cert-change-disclaimer',
      },
      {
        // Cert active + not draft + only working cap changed → confirm working capacity
        fn: (req, res) => isCertActiveAndNotDraft(req, res) && !!req.sessionModel.get('onlyWorkingCapChanged'),
        next: 'confirm-working-capacity',
      },
      {
        // Draft cell with cert active → skip confirmation (existing behavior)
        fn: (_req, res) => canEditCna(res.locals.prisonConfiguration, res.locals.decoratedLocation),
        next: 'confirm-skip',
      },
      // Non-cert → normal confirmation
      'confirm',
    ],
    controller: ChangeCellCapacity,
    template: '../../partials/formStep',
  },
  '/confirm': {
    controller: ConfirmCellCapacity,
  },
  '/confirm-skip': {
    controller: ConfirmCellCapacity,
    skip: true,
  },
  '/confirm-working-capacity': {
    controller: ConfirmWorkingCapacity,
    template: 'confirmWorkingCapacity',
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'details',
    title: (_req, _res) => `Changing cell capacity`,
    caption: (_req, res) => capFirst(res.locals.decoratedLocation?.displayName),
  }),
  '/details': {
    fields: ['explanation'],
    controller: CertChangeDetails,
    template: '../../partials/formStep',
    pageTitle: 'Explain the reason for this change',
    next: 'submit-certification-approval-request',
  },
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
