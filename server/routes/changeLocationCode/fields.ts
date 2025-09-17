import FormWizard from 'hmpo-form-wizard'
import maxLength from '../../validators/maxLength'
import alphanumeric from '../../validators/alphanumeric'

const fields: FormWizard.Fields = {
  locationCode: {
    validate: ['required', alphanumeric, maxLength(5)],
    component: 'govukInput',
    errorMessages: {
      alphanumeric: ':fieldName can only include numbers or letters',
    },
    id: 'locationCode',
    name: 'locationCode',
    classes: 'govuk-input--width-5 local-name-text-input',
    rows: 1,
    label: {
      text: '',
      classes: 'govuk-visually-hidden',
      for: 'locationCode',
    },
    hint: {
      text: 'Set at runtime',
    },
    autocomplete: 'off',
  },
}

export default fields
