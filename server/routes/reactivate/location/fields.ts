import FormWizard from 'hmpo-form-wizard'
import lessThanOrEqualTo from '../../../validators/lessThanOrEqualTo'
import greaterThan from '../../../validators/greaterThan'
import SetCellType from '../../../commonTransactions/setCellType'

const fields: FormWizard.Fields = {
  baselineCna: {
    validate: ['required', 'numeric', lessThanOrEqualTo(99)],
    errorMessages: {
      nonZeroForNormalCell: 'Baseline CNA cannot be 0 for a normal accommodation cell',
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
      nonZeroForNormalCell: 'Working capacity cannot be 0 for a normal accommodation cell',
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
  ...SetCellType.getFields(),
}

export default fields
