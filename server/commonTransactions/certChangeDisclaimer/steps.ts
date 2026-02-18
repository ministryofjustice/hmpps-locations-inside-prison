import FormWizard from 'hmpo-form-wizard'

const steps: FormWizard.Steps = {
  '/': {
    pageTitle: 'This requires a change to the cell certificate',
    templatePath: 'commonTransactions',
    template: 'certChangeDisclaimer',
  },
}

export default steps
