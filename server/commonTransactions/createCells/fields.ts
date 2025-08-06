import FormWizard from 'hmpo-form-wizard'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import SetCellType from '../setCellType'

const fields: FormWizard.Fields = {
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
    hideWhenRemoved: true,
    id: 'accommodationType',
    name: 'accommodationType',
    errorMessages: {
      required: 'Select an accommodation type',
    },
    fieldset: {
      legend: {
        text: 'Accommodation type',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [
      { text: 'Normal accommodation', value: 'NORMAL_ACCOMMODATION' },
      { text: 'Care and separation', value: 'CARE_AND_SEPARATION' },
      { text: 'Healthcare inpatients', value: 'HEALTHCARE_INPATIENTS' },
    ],
    autocomplete: 'off',
  },
  cellsToCreate: {
    validate: ['required', 'numeric', lessThanOrEqualTo(999)],
    component: 'govukInput',
    errorMessages: {
      required: 'Enter how many cells you want to create',
      numeric: 'Enter the number of cells you want to create',
      lessThanOrEqualTo: 'You can create a maximum of 999 cells at once',
    },
    id: 'cellsToCreate',
    name: 'cellsToCreate',
    classes: 'govuk-input--width-5',
    rows: 1,
    label: {
      text: 'How many cells do you want to create?',
      classes: 'govuk-label--m',
      for: 'cellsToCreate',
    },
    autocomplete: 'off',
  },
  cellNumber: {
    validate: ['required', 'numeric'],
    component: 'govukInput',
    id: 'cellNumber',
    name: 'cellNumber',
    errorMessages: {
      notUnique: 'Two cells have the same number',
    },
    classes: 'govuk-input--width-5',
    rows: 1,
    autocomplete: 'off',
  },
  doorNumber: {
    errorMessages: {
      notUnique: 'A cell with this door number already exists',
      taken: 'A cell with this door number already exists',
    },
    validate: ['required'],
    component: 'govukInput',
    id: 'doorNumber',
    name: 'doorNumber',
    classes: 'govuk-input--width-5',
    rows: 1,
    autocomplete: 'off',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
  },
  ...SetCellType.getFields(),
}

export default fields
