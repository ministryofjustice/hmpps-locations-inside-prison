import ReactivateCellsInit from '../../../controllers/reactivate/cells/init'
import ReactivateCellsCheckCapacity from '../../../controllers/reactivate/cells/checkCapacity'
import ReactivateCellsChangeCapacity from '../../../controllers/reactivate/cells/changeCapacity'
import ReactivateCellsConfirm from '../../../controllers/reactivate/cells/confirm'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    controller: ReactivateCellsInit,
    next: 'check-capacity',
  },
  '/check-capacity': {
    controller: ReactivateCellsCheckCapacity,
    next: 'confirm',
    template: 'checkCapacity',
  },
  '/change-capacity/:locationId': {
    checkJourney: false,
    controller: ReactivateCellsChangeCapacity,
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'check-capacity',
    template: 'changeCapacity',
  },
  '/confirm': {
    controller: ReactivateCellsConfirm,
  },
}

export default steps
