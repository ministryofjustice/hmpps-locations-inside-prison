import FormWizard from 'hmpo-form-wizard'
import notEqual from '../../validators/notEqual'

const fields: FormWizard.Fields = {
  isUpdateNeeded: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'isUpdateNeeded',
    name: 'isUpdateNeeded',
    errorMessages: { required: 'Select if you need to update the operational capacity' },
    fieldset: {
      legend: {
        text: 'Do you need to update the operational capacity as part of this change?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      { text: 'Yes, I need to update it', value: 'YES' },
      { text: 'No', value: 'NO' },
    ],
    autocomplete: 'off',
  },
  currentSignedOpCap: {
    remove: () => true,
    hideWhenRemoved: false,
    component: 'govukInput',
    id: 'currentSignedOpCap',
    name: 'currentSignedOpCap',
    label: {
      text: 'Current signed operational capacity',
      classes: 'govuk-label--m',
      for: 'currentSignedOpCap',
    },
    autocomplete: 'off',
  },
  newSignedOpCap: {
    validate: ['required', 'numeric', notEqual({ field: 'currentSignedOpCap' })],
    component: 'govukInput',
    id: 'newSignedOpCap',
    name: 'newSignedOpCap',
    classes: 'govuk-input--width-3',
    label: {
      text: 'New signed operational capacity',
      classes: 'govuk-label--m',
      for: 'newSignedOpCap',
    },
    autocomplete: 'off',
  },
  explanation: {
    validate: ['required'],
    component: 'govukTextarea',
    errorMessages: {
      required: 'Explain why you need to update the signed operational capacity',
    },
    id: 'explanation',
    name: 'explanation',
    rows: 5,
    label: {
      text: 'Explain why you need to update the signed operational capacity',
      classes: 'govuk-label--m',
      for: 'explanation',
    },
    hint: {
      text: 'This will help the authorising director understand the need for the change to capacity.',
    },
    autocomplete: 'off',
  },
}

export default fields
