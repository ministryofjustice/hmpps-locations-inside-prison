import FormWizard from 'hmpo-form-wizard'
import CertApprovalStatusChangeConfirm from '../../../controllers/admin/certification/confirm'

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
    controller: CertApprovalStatusChangeConfirm,
  },
}

export default steps
