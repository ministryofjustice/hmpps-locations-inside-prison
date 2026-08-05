import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import RequestsPending from '../../commonTransactions/requestsPending'
import FormStep from '../../controllers/base/formStep'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import paths from '../../utils/paths'

const hasPendingApprovalsBelow = (_req: FormWizard.Request, res: Response) =>
  res.locals.pendingApprovalsBelow.hasPendingBelow

const locationPage = (_req: FormWizard.Request, res: Response) => paths.location.view(res.locals.decoratedLocation)

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: locationPage,
    next: [{ fn: hasPendingApprovalsBelow, next: 'requests-pending' }, 'cert-change-disclaimer'],
  },
  ...RequestsPending.getSteps(),
  ...CertChangeDisclaimer.getSteps({
    next: 'reason',
    title: (_req, _res) => 'Archiving a location',
  }),
  '/reason': {
    pageTitle: 'Why is this location is being archived?',
    editable: true,
    editBackStep: 'submit-certification-approval-request',
    fields: ['reason'],
    controller: FormStep,
    next: 'update-signed-op-cap',
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
