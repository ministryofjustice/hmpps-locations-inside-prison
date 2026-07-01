import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import RequestsPending from '../../controllers/requestsPending'

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
}

export default steps
