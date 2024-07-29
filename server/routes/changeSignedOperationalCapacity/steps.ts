import ChangeSignedOperationalCapacity from '../../controllers/changeSignedOperationalCapacity'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'change',
  },
  '/change': {
    fields: ['newSignedOperationalCapacity', 'prisonGovernorApproval'],
    controller: ChangeSignedOperationalCapacity,
  },
}

export default steps
