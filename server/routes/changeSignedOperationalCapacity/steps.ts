import FormWizard from 'hmpo-form-wizard'
import ChangeSignedOperationalCapacity from '../../controllers/changeSignedOperationalCapacity'

const steps: FormWizard.Steps = {
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
