import ReactivateCellConfirm from '../../../controllers/reactivate/cell/confirm'
import ReactivateCellDetails from '../../../controllers/reactivate/cell/details'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'confirm',
    controller: ReactivateCellDetails,
  },
  '/confirm': {
    fields: ['confirm'],
    controller: ReactivateCellConfirm,
  },
}

export default steps
