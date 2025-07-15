import maxLength from '../../validators/maxLength'

const fields = {
  localName: {
    component: 'govukCharacterCount',
    validate: ['required', maxLength(30)],
    maxlength: 30,
    errorMessages: { required: 'Enter a local name', taken: 'A location with this name already exists' },
    id: 'localName',
    name: 'localName',
    classes: 'govuk-!-width-three-quarters local-name-text-input',
    rows: 1,
    label: {
      text: 'Local name',
      classes: 'govuk-!-display-none',
      for: 'localName',
    },
    autocomplete: 'off',
  },
}

export default fields
