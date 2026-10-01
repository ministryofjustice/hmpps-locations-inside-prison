import FormWizard from 'hmpo-form-wizard'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  certifiedChange: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'certifiedChange',
    name: 'certifiedChange',
    errorMessages: { required: 'Choose how to fix this difference' },
    label: {
      text: 'Choose how to fix this difference',
    },
    fieldset: {
      legend: {
        text: 'Choose how to fix this difference',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [{ text: 'set at runtime', value: '' }],
    autocomplete: 'off',
  },
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
