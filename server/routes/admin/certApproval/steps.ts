import CertApprovalStatusChangeConfirm from '../../../controllers/admin/certification/confirm'

const steps = {
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
