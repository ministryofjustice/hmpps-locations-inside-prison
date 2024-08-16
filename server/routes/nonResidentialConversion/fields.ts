const fields = {
  convertedCellType: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select a non-residential room type' },
    id: 'convertedCellType',
    name: 'convertedCellType',
    fieldset: {
      legend: {
        text: 'What is the room being used for?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  otherConvertedCellType: {
    validate: ['required'],
    id: 'otherConvertedCellType',
    name: 'otherConvertedCellType',
    classes: 'govuk-input--width-2',
    label: {
      text: 'Room description',
    },
    autocomplete: 'off',
    dependent: {
      field: 'convertedCellType',
      value: 'OTHER',
    },
  },
}

export default fields
