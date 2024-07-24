import ChangeSignedOperationalCapacity from '../../controllers/changeSignedOperationalCapacity'
import CancelChangeSignedOperationalCapacity from '../../controllers/changeSignedOperationalCapacity/cancel'

const steps = {
  '/': {
    entryPoint: true,
    fields: ['newSignedOperationalCapacity', 'prisonGovernorApproval'],
    controller: ChangeSignedOperationalCapacity,
  },
  '/cancel': {
    checkJourney: false,
    reset: true,
    resetJourney: true,
    controller: CancelChangeSignedOperationalCapacity,
  },
}

export default steps
