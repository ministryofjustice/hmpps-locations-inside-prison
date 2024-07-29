import ChangeCellCapacity from '../../controllers/changeCellCapacity'
import ConfirmCellCapacity from '../../controllers/changeCellCapacity/confirm'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'change',
  },
  '/confirm': {
    fields: ['confirm'],
    controller: ConfirmCellCapacity,
  },
  '/change': {
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'confirm',
    controller: ChangeCellCapacity,
  },
}

export default steps
