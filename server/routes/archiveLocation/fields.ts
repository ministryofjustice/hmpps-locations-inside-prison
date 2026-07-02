import FormWizard from 'hmpo-form-wizard'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'

const fields: FormWizard.Fields = {
  reason: {
    validate: ['required'],
    component: 'govukTextarea',
    errorMessages: {
      required: 'Explain why this location is being archived',
    },
    id: 'reason',
    name: 'reason',
    rows: 5,
    label: {
      text: 'Why is this location is being archived?',
      classes: 'govuk-label--l govuk-!-margin-bottom-6',
      for: 'reason',
      isPageHeading: true,
    },
    hint: {
      text: 'This will help the authorising director understand why the location is being archived and permanently removed from the cell certificate.',
    },
    autocomplete: 'off',
    // Don't strip newlines
    'ignore-defaults': true,
  },
  ...UpdateSignedOpCap.getFields(),
}

export default fields
