import FormWizard from 'hmpo-form-wizard'

const steps: FormWizard.Steps = {
  '/': {
    next: 'step2',
    fields: ['text1'],
    pageTitle: 'Create Cells Page 1',
  },
  '/step2': {
    next: 'step3',
    fields: ['text2'],
    pageTitle: 'Create Cells Page 2',
  },
  '/step3': {
    pageTitle: 'Create Cells Page 3',
  },
}

export default steps
