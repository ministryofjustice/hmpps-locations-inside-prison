import FormWizard from 'hmpo-form-wizard'
import Confirm from './confirm'

const steps: FormWizard.Steps = {
  '/': {
    template: '../../commonTransactions/submitCertificationApprovalRequest/confirm',
    fields: ['confirmation'],
    controller: Confirm,
  },
}

export default steps
