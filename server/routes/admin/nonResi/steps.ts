import FormWizard from 'hmpo-form-wizard'
import NonResiStatusChangeConfirm from '../../../controllers/admin/nonResi/confirm'

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
    controller: NonResiStatusChangeConfirm,
  },
}

export default steps
