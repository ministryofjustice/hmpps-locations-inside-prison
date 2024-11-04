import FormWizard from 'hmpo-form-wizard'
import ReactivateParentSelect from '../../../controllers/reactivate/parent/select'
import ReactivateParentCheckCapacity from '../../../controllers/reactivate/parent/checkCapacity'
import ReactivateParentConfirm from '../../../controllers/reactivate/parent/confirm'
import ReactivateParentChangeCapacity from '../../../controllers/reactivate/parent/changeCapacity'

const isSelect = (req: FormWizard.Request) => {
  return !!req.query.select
}

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [{ fn: isSelect, next: 'select' }, 'check-capacity'],
  },
  '/select': {
    controller: ReactivateParentSelect,
    fields: ['selectLocations'],
    next: 'check-capacity',
  },
  '/check-capacity': {
    controller: ReactivateParentCheckCapacity,
    next: 'confirm',
    template: 'checkCapacity',
  },
  '/change-capacity/:cellId': {
    checkJourney: false,
    controller: ReactivateParentChangeCapacity,
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'check-capacity',
    template: 'changeCapacity',
  },
  '/confirm': {
    controller: ReactivateParentConfirm,
  },
}

export default steps
