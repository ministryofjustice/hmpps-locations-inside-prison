import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields = {
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
  ...UpdateSignedOpCap.getFields(),
  ...SubmitCertificationApprovalRequest.getFields(),
  'submit-certification-approval-request_confirmation': {
    ...SubmitCertificationApprovalRequest.getFields()['submit-certification-approval-request_confirmation'],
    label: {
      text: 'Confirm changes have been agreed',
    },
    fieldset: {
      legend: {
        text: 'Confirm changes have been agreed',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    hint: {
      text: 'By submitting this request, you confirm that this change has been agreed with the PGD or capacity management team.',
    },
    errorMessages: { required: 'Confirm that changes have been agreed' },
  },
}

export default fields
