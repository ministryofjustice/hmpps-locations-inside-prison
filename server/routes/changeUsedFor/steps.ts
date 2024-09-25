import ChangeUsedFor from '../../controllers/changeUsedFor/details'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['usedFor'],
    controller: ChangeUsedFor,
  },
}

export default steps
