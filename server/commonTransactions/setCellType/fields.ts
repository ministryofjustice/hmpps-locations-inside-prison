import FormWizard from 'hmpo-form-wizard'
import capacityFields from '../../routes/changeCellCapacity/fields'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import UpdateSignedOpCap from '../updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  accommodationType: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'accommodationType',
    name: 'accommodationType',
    errorMessages: {
      required: 'Select if it is a normal or special cell type',
    },
    items: [
      {
        text: 'Normal cell type',
        value: 'NORMAL_ACCOMMODATION',
        hint: {
          text: 'For example, an accessible cell or an escape list cell.',
        },
      },
      {
        text: 'Special cell type',
        value: 'SPECIAL_ACCOMMODATION',
        hint: {
          text: 'For example, a dry cell or an unfurnished cell.',
        },
      },
    ],
    autocomplete: 'off',
  },
  specialistCellTypes: {
    component: 'govukRadios',
    validate: ['required'],
    id: 'specialistCellTypes',
    name: 'specialistCellTypes',
    errorMessages: {
      required: 'Select a cell type',
    },
    items: [{ text: 'set at runtime', value: '' }],
  },
  normalCellTypes: {
    component: 'govukCheckboxes',
    multiple: true,
    id: 'normalCellTypes',
    name: 'normalCellTypes',
    validate: ['required'],
    errorMessages: { required: 'Select a cell type' },
    hint: { text: 'Select all that apply.' },
    items: [{ text: 'set at runtime', value: '' }],
  },
  baselineCna: {
    ...capacityFields.baselineCna,
    validate: ['required', 'numeric', lessThanOrEqualTo(99), lessThanOrEqualTo({ field: 'maxCapacity' })],
  },
  workingCapacity: {
    ...capacityFields.workingCapacity,
    validate: ['required', 'numeric', lessThanOrEqualTo(99), lessThanOrEqualTo({ field: 'maxCapacity' })],
  },
  maxCapacity: {
    ...capacityFields.maxCapacity,
  },
  ...UpdateSignedOpCap.getFields(),
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
