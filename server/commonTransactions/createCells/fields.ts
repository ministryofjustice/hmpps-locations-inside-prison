import FormWizard from 'hmpo-form-wizard'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import SetCellType from '../setCellType'
import greaterThan from '../../validators/greaterThan'

const fields: FormWizard.Fields = {
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
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
  baselineCna: {
    validate: ['required', 'numeric', lessThanOrEqualTo(99)],
    errorMessages: {
      greaterThan: 'Baseline CNA cannot be 0 for a non-special cell',
    },
    component: 'govukInput',
    id: 'baselineCna',
    name: 'baselineCna',
    label: {
      text: 'Baseline CNA',
      classes: 'govuk-visually-hidden',
      for: 'baselineCna',
    },
    classes: 'govuk-input--width-3',
    rows: 1,
    autocomplete: 'off',
    nameForErrors: 'Baseline CNA',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
  },
  workingCapacity: {
    validate: ['required', 'numeric', lessThanOrEqualTo(99)],
    errorMessages: {
      greaterThan: 'Working capacity cannot be 0 for a non-special cell',
    },
    component: 'govukInput',
    id: 'workingCapacity',
    name: 'workingCapacity',
    label: {
      text: 'Working capacity',
      classes: 'govuk-visually-hidden',
      for: 'workingCapacity',
    },
    classes: 'govuk-input--width-3',
    rows: 1,
    autocomplete: 'off',
    nameForErrors: 'Working capacity',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
  },
  maximumCapacity: {
    validate: ['required', 'numeric', greaterThan(0), lessThanOrEqualTo(99)],
    component: 'govukInput',
    id: 'maximumCapacity',
    name: 'maximumCapacity',
    errorMessages: {
      greaterThan: 'Maximum capacity cannot be 0',
    },
    label: {
      text: 'Maximum capacity',
      classes: 'govuk-visually-hidden',
      for: 'maximumCapacity',
    },
    classes: 'govuk-input--width-3',
    rows: 1,
    autocomplete: 'off',
    nameForErrors: 'Maximum capacity',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
  },
  bulkSanitation: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'bulkSanitation',
    name: 'bulkSanitation',
    errorMessages: {
      required: 'Select yes if all cells have in-cell sanitation',
    },
    items: [
      { text: 'Yes', value: 'YES' },
      { text: 'No', value: 'NO' },
    ],
    autocomplete: 'off',
    hint: {
      text: 'This means a cell includes both a toilet and wash basin.',
    },
  },
  withoutSanitation: {
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select any cells without in-cell sanitation' },
    id: 'withoutSanitation',
    name: 'withoutSanitation',
    hint: {
      text: 'This means a cell doesn’t have a toilet or a wash basin.',
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  usedFor: {
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select what the location is used for' },
    id: 'usedFor',
    name: 'usedFor',
    hint: {
      text: 'Select any that apply to all cells.',
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
}

export default fields
