import FormWizard from 'hmpo-form-wizard'

const steps: FormWizard.Steps = {
  '/': {
    pageTitle: 'This requires a change to the cell certificate',
    template: '../../commonTransactions/certChangeDisclaimer',
  },
}

export default steps
