import maxLength from '../../validators/maxLength'

const fields = {
  locationCode: {
    component: 'govukInput',
    errorMessages: {},
    id: 'locationCode',
    name: 'locationCode',
    classes: 'govuk-input--width-5 local-name-text-input',
    rows: 1,
    label: {
      text: '',
      classes: 'govuk-label--m',
      for: 'locationCode',
    },
    hint: {
      text: 'Set at runtime',
    },
    autocomplete: 'off',
  },
  localName: {
    component: 'govukCharacterCount',
    validate: [maxLength(30)],
    maxlength: 30,
    errorMessages: {},
    id: 'localName',
    name: 'localName',
    classes: 'govuk-!-width-one-half local-name-text-input',
    rows: 1,
    label: {
      text: 'Local name (optional)',
      classes: 'govuk-label--m',
      for: 'localName',
    },
    hint: {
      text: 'This will change how the name displays on location lists but won’t change the location code.',
    },
    autocomplete: 'off',
  },
}

export default fields
