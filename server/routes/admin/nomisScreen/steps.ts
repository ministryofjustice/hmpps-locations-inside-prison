import FormWizard from 'hmpo-form-wizard'
import NomisScreenStatusChangeConfirm from '../../../controllers/admin/nomisScreen/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'confirm',
  },
  '/confirm': {
    fields: ['screenStatus'],
    controller: NomisScreenStatusChangeConfirm,
  },
}

export default steps
