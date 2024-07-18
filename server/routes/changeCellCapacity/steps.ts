import ChangeCellCapacity from '../../controllers/changeCellCapacity'
import ConfirmCellCapacity from '../../controllers/changeCellCapacity/confirm'
import CancelChangeCellCapacity from '../../controllers/changeCellCapacity/cancel'

const steps = {
  '/': {
    entryPoint: true,
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'confirm',
    controller: ChangeCellCapacity,
  },
  '/confirm': {
    fields: ['confirm'],
    controller: ConfirmCellCapacity,
  },
  '/cancel': {
    checkJourney: false,
    reset: true,
    resetJourney: true,
    controller: CancelChangeCellCapacity,
  },
}

export default steps
