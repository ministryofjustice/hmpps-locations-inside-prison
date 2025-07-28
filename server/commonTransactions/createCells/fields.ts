import FormWizard from 'hmpo-form-wizard'
import maxLength from '../../validators/maxLength'

const fields: FormWizard.Fields = {
  text1: {
    component: 'govukCharacterCount',
    validate: ['required', maxLength(10)],
    maxlength: 10,
    errorMessages: { required: 'Enter a text 1' },
    id: 'text1',
    name: 'text1',
    classes: 'govuk-!-width-three-quarters local-name-text-input',
    rows: 1,
    label: {
      text: 'Text 1',
      classes: 'govuk-label--m',
      for: 'text1',
    },
    autocomplete: 'off',
  },
  text2: {
    component: 'govukCharacterCount',
    validate: ['required', maxLength(5)],
    maxlength: 5,
    errorMessages: { required: 'Enter a text 2' },
    id: 'text2',
    name: 'text2',
    classes: 'govuk-!-width-three-quarters local-name-text-input',
    rows: 1,
    label: {
      text: 'Text 2',
      classes: 'govuk-label--m',
      for: 'text2',
    },
    autocomplete: 'off',
  },
}

export default fields
