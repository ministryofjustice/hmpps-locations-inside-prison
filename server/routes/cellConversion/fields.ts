import setCellTypeFields from '../setCellType/fields'
import capacityFields from '../changeCellCapacity/fields'

const fields = {
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select an accommodation type' },
    id: 'accommodationType',
    name: 'accommodationType',
    fieldset: {
      legend: {
        text: 'What type of accommodation is it?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  hasSpecificCellType: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select yes if it is a specific type of cell' },
    id: 'hasSpecificCellType',
    name: 'hasSpecificCellType',
    hint: {
      text: 'For example a wheelchair accessible cell or a constant supervision cell.',
    },
    fieldset: {
      legend: {
        text: 'Is it a specific type of cell?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      { text: 'Yes', value: 'yes' },
      { text: 'No', value: 'no' },
    ],
  },
  maxCapacity: {
    ...capacityFields.maxCapacity,
  },
  specialistCellTypes: {
    ...setCellTypeFields.specialistCellTypes,
    fieldset: {
      legend: {
        text: 'Set specific cell type',
        classes: 'govuk-fieldset__legend--m',
      },
    },
  },
  usedForTypes: {
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select what the location is used for' },
    id: 'usedForTypes',
    name: 'usedForTypes',
    hint: {
      text: 'Select all that apply.',
    },
    fieldset: {
      legend: {
        text: 'What is the location used for?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  workingCapacity: {
    ...capacityFields.workingCapacity,
  },
}

export default fields
