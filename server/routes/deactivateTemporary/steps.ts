import DeactivateTemporaryDetails from '../../controllers/deactivateTemporary/details'
import DeactivateTemporaryConfirm from '../../controllers/deactivateTemporary/confirm'
import DeactivateTemporaryOccupied from '../../controllers/deactivateTemporary/occupied'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['deactivationReason', 'estimatedReactivationDate', 'planetFmReference'],
    next: 'confirm',
    controller: DeactivateTemporaryDetails,
  },
  '/confirm': {
    fields: ['confirm'],
    controller: DeactivateTemporaryConfirm,
  },
  '/occupied': {
    checkJourney: false,
    controller: DeactivateTemporaryOccupied,
  },
}

export default steps
