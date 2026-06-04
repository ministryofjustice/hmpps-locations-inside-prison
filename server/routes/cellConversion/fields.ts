import capacityFields from '../changeCellCapacity/fields'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import greaterThan from '../../validators/greaterThan'
import SetCellType from '../../commonTransactions/setCellType'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

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
    component: 'govukCheckboxes',
    multiple: true,
    validate: ['required'],
    errorMessages: { required: 'Select a cell type' },
    id: 'specialistCellTypes',
    name: 'specialistCellTypes',
    label: {
      text: 'Set specific cell type',
    },
    hint: {
      text: 'Select all that apply.',
    },
    items: [{ text: 'set at runtime', value: '' }],
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
  CERT_baselineCna: {
    // removed only when field is not dynamically added (in editCapacity.ts)
    remove: () => true,
    hideWhenRemoved: true,
    validate: ['required', 'numeric', lessThanOrEqualTo(99)],
    errorMessages: {
      nonZeroForNormalCell: 'Baseline CNA cannot be 0 for a normal accommodation cell',
    },
    component: 'govukInput',
    id: 'CERT_baselineCna',
    name: 'CERT_baselineCna',
    label: {
      text: 'Baseline CNA',
      classes: 'govuk-visually-hidden',
      for: 'CERT_baselineCna',
    },
    classes: 'govuk-input--width-3',
    rows: 1,
    autocomplete: 'off',
    nameForErrors: 'Baseline CNA',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
  },
  CERT_workingCapacity: {
    // removed only when field is not dynamically added (in editCapacity.ts)
    remove: () => true,
    hideWhenRemoved: true,
    validate: ['required', 'numeric', lessThanOrEqualTo(99)],
    errorMessages: {
      nonZeroForNormalCell: 'Working capacity cannot be 0 for a normal accommodation cell',
    },
    component: 'govukInput',
    id: 'CERT_workingCapacity',
    name: 'CERT_workingCapacity',
    label: {
      text: 'Working capacity',
      classes: 'govuk-visually-hidden',
      for: 'CERT_workingCapacity',
    },
    classes: 'govuk-input--width-3',
    rows: 1,
    autocomplete: 'off',
    nameForErrors: 'Working capacity',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
  },
  CERT_maximumCapacity: {
    validate: ['required', 'numeric', greaterThan(0), lessThanOrEqualTo(99)],
    component: 'govukInput',
    id: 'CERT_maximumCapacity',
    name: 'CERT_maximumCapacity',
    errorMessages: {
      greaterThan: 'Maximum capacity cannot be 0',
    },
    label: {
      text: 'Maximum capacity',
      classes: 'govuk-visually-hidden',
      for: 'CERT_maximumCapacity',
    },
    classes: 'govuk-input--width-3',
    rows: 1,
    autocomplete: 'off',
    nameForErrors: 'Maximum capacity',
    formGroup: {
      classes: 'govuk-!-margin-bottom-0',
    },
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
  inCellSanitation: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'inCellSanitation',
    name: 'inCellSanitation',
    errorMessages: {
      required: 'Select yes if the cell has in-cell sanitation',
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
  ...SetCellType.getFields(),
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
