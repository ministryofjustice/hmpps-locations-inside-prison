import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import RequestsPending from '../../controllers/requestsPending'
import FormInitialStep from '../../controllers/base/formInitialStep'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const hasPendingApprovalsBelow = (_req: FormWizard.Request, res: Response) =>
  res.locals.pendingApprovalsBelow.hasPendingBelow

const locationPage = (_req: FormWizard.Request, res: Response) =>
  `/view-and-update-locations/${res.locals.decoratedLocation.prisonId}/${res.locals.decoratedLocation.id}`

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: locationPage,
    next: [{ fn: hasPendingApprovalsBelow, next: 'requests-pending' }, 'cert-change-disclaimer'],
  },
  '/requests-pending': {
    backLink: locationPage,
    checkJourney: false,
    controller: RequestsPending,
    templatePath: 'pages/requestsPending',
    template: 'index',
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'reason',
    title: (_req, _res) => 'Archiving a location',
  }),
  '/reason': {
    pageTitle: 'Why is this location is being archived?',
    editable: true,
    editBackStep: 'submit-certification-approval-request',
    fields: ['reason'],
    controller: FormInitialStep,
    next: 'update-signed-op-cap',
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
