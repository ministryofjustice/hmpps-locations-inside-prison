import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import ChangeSignedOperationalCapacity from '../../controllers/changeSignedOperationalCapacity'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

function isCertChange(_req: FormWizard.Request, res: Response) {
  return res.locals.prisonConfiguration?.certificationApprovalRequired === 'ACTIVE'
}

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) => `/view-and-update-locations/${res.locals.prisonId}`,
    next: [{ fn: isCertChange, next: 'update-signed-op-cap/is-under-review' }, 'change'],
  },
  '/change': {
    fields: ['newSignedOperationalCapacity', 'prisonGovernorApproval'],
    controller: ChangeSignedOperationalCapacity,
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
