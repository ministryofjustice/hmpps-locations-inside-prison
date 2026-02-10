import FormWizard from 'hmpo-form-wizard'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  inCellSanitation: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'inCellSanitation',
    name: 'inCellSanitation',
    errorMessages: {
      required: 'Select yes if the cell has in-cell sanitation',
    },
    items: [
      { text: 'Yes', value: 'YES' },
      { text: 'No', value: 'NO' },
    ],
    autocomplete: 'off',
    hint: {
      text: 'This means the cell includes both a toilet and wash basin.',
    },
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
