import ReactivateCellConfirm from '../../../controllers/reactivate/cell/confirm'
import ReactivateCellDetails from '../../../controllers/reactivate/cell/details'
import ReactivateCellInit from '../../../controllers/reactivate/cell/init'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    next: 'details',
    controller: ReactivateCellInit,
  },
  '/details': {
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'confirm',
    controller: ReactivateCellDetails,
    layout: '../../partials/formStep',
  },
  '/confirm': {
    fields: ['confirm'],
    controller: ReactivateCellConfirm,
  },
}

export default steps
