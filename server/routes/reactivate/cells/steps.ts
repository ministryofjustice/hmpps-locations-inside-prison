import FormWizard from 'hmpo-form-wizard'
import ReactivateCellsInit from '../../../controllers/reactivate/cells/init'
import ReactivateCellsCheckCapacity from '../../../controllers/reactivate/cells/checkCapacity'
import ReactivateCellsChangeCapacity from '../../../controllers/reactivate/cells/changeCapacity'
import ReactivateCellsConfirm from '../../../controllers/reactivate/cells/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    controller: ReactivateCellsInit,
    next: 'check-capacity',
  },
  '/check-capacity': {
    controller: ReactivateCellsCheckCapacity,
    next: 'confirm',
  },
  '/change-capacity/:locationId': {
    checkJourney: false,
    controller: ReactivateCellsChangeCapacity,
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'check-capacity',
    template: '../../../partials/formStep',
  },
  '/confirm': {
    controller: ReactivateCellsConfirm,
  },
}

export default steps
