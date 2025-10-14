import FormWizard from 'hmpo-form-wizard'

const fields: FormWizard.Fields = {
  approveOrReject: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select if you want to approve or reject this change' },
    id: 'approveOrReject',
    name: 'approveOrReject',
    fieldset: {
      legend: {
        text: 'Do you want to approve or reject this change?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      { text: 'Approve change', value: 'APPROVE' },
      { text: 'Reject change', value: 'REJECT' },
    ],
  },
  cellsMeetStandards: {
    component: 'govukCheckboxes',
    multiple: false,
    validate: ['required'],
    errorMessages: { required: 'Confirm that the cells meet the certification standards' },
    id: 'cellsMeetStandards',
    name: 'cellsMeetStandards',
    label: {
      text: 'Confirm certification standards',
    },
    fieldset: {
      legend: {
        text: 'Confirm certification standards',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    hint: {
      text: 'In pursuance of section 14 of the Prison Act 1952 and the Prison Rules/Young Offender Institution Rules, I certify that the cells meet the required standards for size, lighting, heating, ventilation and health. They are also equipped to allow a prisoner to communicate with an officer of the establishment at any time.',
    },
    items: [
      {
        text: 'I understand and agree with the above statement.',
        value: 'yes',
      },
    ],
  },
  explanation: {
    validate: ['required'],
    component: 'govukTextarea',
    errorMessages: {
      required: 'Explain why you are rejecting this request',
    },
    id: 'explanation',
    name: 'explanation',
    rows: 5,
    label: {
      text: 'Explain why you are rejecting this request',
      classes: 'govuk-label--m',
      for: 'explanation',
    },
    hint: {
      text: 'This will help the person who submitted the request understand why it has been rejected.',
    },
    autocomplete: 'off',
    // Don't strip newlines
    'ignore-defaults': true,
  },
}

export default fields
