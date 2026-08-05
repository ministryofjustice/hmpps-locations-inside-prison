import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import ReactivateParentSelect from '../../../controllers/reactivate/parent/select'
import ReactivateParentCheckCapacity from '../../../controllers/reactivate/parent/checkCapacity'
import ReactivateParentConfirm from '../../../controllers/reactivate/parent/confirm'
import ReactivateParentChangeCapacity from '../../../controllers/reactivate/parent/changeCapacity'
import paths from '../../../utils/paths'
import RequestsPending from '../../../commonTransactions/requestsPending'

const isSelect = (req: FormWizard.Request) => {
  return !!req.query.select
}

const hasPendingApprovalsBelow = (_req: FormWizard.Request, res: Response) =>
  res.locals.pendingApprovalsBelow.hasPendingBelow

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      { fn: hasPendingApprovalsBelow, next: 'requests-pending' },
      { fn: isSelect, next: 'select' },
      'check-capacity',
    ],
    backLink: (_req, res) => paths.location.view(res.locals.decoratedLocation),
  },
  ...RequestsPending.getSteps(),
  '/select': {
    controller: ReactivateParentSelect,
    fields: ['selectLocations'],
    next: 'check-capacity',
    template: '../../../partials/formStep',
  },
  '/check-capacity': {
    controller: ReactivateParentCheckCapacity,
    pageTitle: 'Check capacity of cells',
    next: 'confirm',
  },
  '/change-capacity/:cellId': {
    checkJourney: false,
    controller: ReactivateParentChangeCapacity,
    pageTitle: 'Change cell capacity',
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'check-capacity',
    template: '../../../partials/formStep',
  },
  '/confirm': {
    controller: ReactivateParentConfirm,
  },
}

export default steps
