import FormWizard from 'hmpo-form-wizard'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  doorNumber: {
    errorMessages: {
      notUnique: 'A cell with this door number already exists',
      taken: 'A cell with this door number already exists',
    },
    validate: ['required'],
    component: 'govukInput',
    hint: {
      text: 'This is the actual number written on the cell door.',
    },
    label: {
      text: 'Door number',
      classes: 'govuk-visually-hidden',
      for: 'doorNumber',
    },
    id: 'doorNumber',
    name: 'doorNumber',
    classes: 'govuk-input--width-5',
    rows: 1,
    autocomplete: 'off',
  },
  explanation: {
    remove: (_req, res) => res.locals.decoratedResidentialSummary.location.status === 'DRAFT',
    hideWhenRemoved: true,
    validate: ['required'],
    component: 'govukTextarea',
    errorMessages: {
      required: 'Explain the reason for this change',
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
    // Don't strip newlines
    'ignore-defaults': true,
  },
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
