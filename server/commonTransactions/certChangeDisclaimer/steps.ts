import FormWizard from 'hmpo-form-wizard'
import CertChangeDisclaimerController from './controller'

const steps: FormWizard.Steps = {
  '/': {
    pageTitle: 'This requires a change to the cell certificate',
    template: '../../commonTransactions/certChangeDisclaimer',
    controller: CertChangeDisclaimerController,
  },
}

export default steps
