import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import greaterThan from '../../validators/greaterThan'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'
import capacityFields from '../changeCellCapacity/fields'

const fields = {
  areYouSure: {
    component: 'govukRadios',
    validate: ['required'],
    errorMessages: { required: 'Select yes if you want to remove the cell type' },
    id: 'areYouSure',
    name: 'areYouSure',
    items: [
      { text: 'Yes, I want to remove the cell type', value: 'yes' },
      { text: 'No, keep the cell type', value: 'no' },
    ],
  },
  baselineCna: {
    ...capacityFields.baselineCna,
    validate: [
      'required',
      'numeric',
      greaterThan(0),
      lessThanOrEqualTo(99),
      lessThanOrEqualTo({ field: 'maxCapacity' }),
    ],
    errorMessages: { greaterThan: 'Baseline certified normal accommodation (CNA) cannot be 0 for a non-special cell' },
  },
  workingCapacity: {
    ...capacityFields.workingCapacity,
    validate: [
      'required',
      'numeric',
      greaterThan(0),
      lessThanOrEqualTo(99),
      lessThanOrEqualTo({ field: 'maxCapacity' }),
    ],
    errorMessages: { greaterThan: 'Working capacity cannot be 0 for a non-special cell' },
  },
  maxCapacity: {
    ...capacityFields.maxCapacity,
  },
  ...UpdateSignedOpCap.getFields(),
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
