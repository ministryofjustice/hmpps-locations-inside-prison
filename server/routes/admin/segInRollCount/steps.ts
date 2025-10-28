import FormWizard from 'hmpo-form-wizard'
import SegInRollCountStatusChangeConfirm from '../../../controllers/admin/segInRollCount/confirm'

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
    controller: SegInRollCountStatusChangeConfirm,
  },
}

export default steps
