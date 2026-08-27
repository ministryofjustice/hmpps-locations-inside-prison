import renderMacro from '../../utils/renderMacro'
import maxLength from '../../validators/maxLength'

const fields = {
  localName: {
    component: 'govukCharacterCount',
    validate: ['required', maxLength(30)],
    maxlength: 30,
    errorMessages: {
      maxLength: 'Local name must be 30 characters or less',
      required: 'Enter a local name',
      taken: 'A location with this name already exists',
    },
    id: 'localName',
    name: 'localName',
    classes: 'govuk-!-width-three-quarters local-name-text-input',
    rows: 1,
    label: {
      text: 'Change local name',
      classes: 'govuk-label--l govuk-!-margin-bottom-6',
      for: 'localName',
      isPageHeading: true,
    },
    autocomplete: 'off',
    formGroup: {
      beforeInput: {
        html: renderMacro('govuk/components/inset-text/macro', 'govukInsetText', {
          text: 'This will change how the name displays on location lists but won’t change the location code (for example A-1-001).',
          classes: 'govuk-!-margin-bottom-6',
        }),
      },
    },
  },
}

export default fields
