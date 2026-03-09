import FormWizard from 'hmpo-form-wizard'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  newSignedOperationalCapacity: {
    component: 'govukInput',
    validate: ['required', 'numeric'],
    id: 'newSignedOperationalCapacity',
    name: 'newSignedOperationalCapacity',
    classes: 'govuk-input--width-3',
    label: {
      text: 'New signed operational capacity',
      classes: 'govuk-fieldset__legend--m',
    },
    autocomplete: 'off',
  },
  prisonGovernorApproval: {
    component: 'govukCheckboxes',
    multiple: false,
    validate: ['required'],
    errorMessages: { required: 'Confirm that the prison governor has approved this change' },
    id: 'prisonGovernorApproval',
    name: 'prisonGovernorApproval',
    label: {
      text: 'Prison governor approval for change',
    },
    fieldset: {
      legend: {
        text: 'Prison governor approval for change',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    hint: {
      text: 'Any change to the signed operational capacity must be approved by the prison governor.',
    },
    items: [
      {
        text: 'I confirm that the signed operational capacity has been approved by the prison governor.',
        value: 'yes',
      },
    ],
  },
  ...SubmitCertificationApprovalRequest.getFields(),
  ...UpdateSignedOpCap.getFields(),
}

fields['submit-certification-approval-request_confirmation'] = {
  ...fields['submit-certification-approval-request_confirmation'],
  label: {
    text: 'Confirm changes have been agreed',
  },
  hint: {
    text: 'I confirm that these changes have been agreed with the PGD and capacity management team.',
  },
  fieldset: {
    legend: {
      ...fields['submit-certification-approval-request_confirmation'].fieldset.legend,
      text: 'Confirm changes have been agreed',
    },
  },
  errorMessages: { required: 'Confirm changes have been agreed' },
}

export default fields
