import ChangeTemporaryDeactivationDetails from '../../controllers/changeTemporaryDeactivationDetails/details'

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
    controller: ChangeTemporaryDeactivationDetails,
    template: '../../partials/formStep',
  },
}

export default steps
