const fields = {
  screenStatus: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select a status for the NOMIS screen' },
    id: 'screenStatus',
    name: 'screenStatus',
    fieldset: {
      legend: {
        text: 'NOMIS screen status',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      {
        value: 'ACCESSIBLE',
        text: 'Accessible — no splash screen message',
      },
      {
        value: 'WARNING',
        text: 'Show splash screen warning the screen will be switched off',
      },
      {
        value: 'BLOCKED',
        text: 'Switch screen off and show splash screen message',
      },
    ],
  },
}

export default fields
