import FormWizard from 'hmpo-form-wizard'

const fields: FormWizard.Fields = {
  explanation: {
    validate: ['required'],
    component: 'govukTextarea',
    errorMessages: {
      required: 'Explain why you are withdrawing this request',
    },
    id: 'explanation',
    name: 'explanation',
    rows: 5,
    label: {
      text: 'Explain why you are withdrawing this request',
      classes: 'govuk-label--m',
      for: 'explanation',
    },
    hint: {
      text: 'This will help the authorising director understand why the request has been withdrawn.',
    },
    autocomplete: 'off',
    // Don't strip newlines
    'ignore-defaults': true,
  },
}

export default fields
