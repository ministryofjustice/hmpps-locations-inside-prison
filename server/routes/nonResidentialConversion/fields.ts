import maxLength from '../../validators/maxLength'

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
    component: 'govukInput',
    validate: ['required', maxLength(30)],
    id: 'otherConvertedCellType',
    name: 'otherConvertedCellType',
    label: {
      text: 'Room description',
    },
    autocomplete: 'off',
  },
}

export default fields
