import FormWizard from 'hmpo-form-wizard'
import maxLength from '../../validators/maxLength'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'

const fields: FormWizard.Fields = {
  convertedCellType: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select a non-residential room type' },
    id: 'convertedCellType',
    name: 'convertedCellType',
    fieldset: {
      legend: {
        text: 'What is the room being used for?',
        classes: 'govuk-fieldset__legend--m',
      },
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  otherConvertedCellType: {
    component: 'govukInput',
    validate: ['required', maxLength(30)],
    id: 'otherConvertedCellType',
    name: 'otherConvertedCellType',
    label: {
      text: 'Room description',
    },
    autocomplete: 'off',
  },
  explanation: {
    remove: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'INACTIVE',
    hideWhenRemoved: true,
    validate: ['required'],
    component: 'govukTextarea',
    errorMessages: {
      required: 'Enter a reason for this change',
    },
    id: 'explanation',
    name: 'explanation',
    rows: 5,
    label: {
      text: 'Explain the reason for this change',
      classes: 'govuk-label--m',
      for: 'explanation',
    },
    hint: {
      text: 'This will help the authorising director understand the need for the change.',
    },
    autocomplete: 'off',
    'ignore-defaults': true,
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
      text: 'By submitting this request, you confirm that this change has been agreed by the PGD.',
    },
    errorMessages: { required: 'Confirm that changes have been agreed' },
  },
}

export default fields
