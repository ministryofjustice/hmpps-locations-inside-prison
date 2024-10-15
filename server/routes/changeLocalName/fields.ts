import maxLength from '../../validators/maxLength'

const fields = {
  localName: {
    component: 'govukCharacterCount',
    validate: ['required', maxLength(30)],
    maxlength: 30,
    errorMessages: { required: 'Enter a local name' },
    id: 'localName',
    name: 'localName',
    classes: 'govuk-!-width-three-quarters local-name-text-input',
    rows: 1,
    label: {
      text: 'Local name',
      classes: 'govuk-fieldset__legend--m govuk-!-display-none',
    },
    autocomplete: 'off',
  },
}

export default fields
