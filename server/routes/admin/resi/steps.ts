import FormWizard from 'hmpo-form-wizard'
import ResiStatusChangeConfirm from '../../../controllers/admin/resi/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'confirm',
  },
  '/confirm': {
    fields: ['activation'],
    controller: ResiStatusChangeConfirm,
  },
}

export default steps
