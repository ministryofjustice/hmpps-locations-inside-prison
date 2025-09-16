import FormWizard from 'hmpo-form-wizard'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  ...UpdateSignedOpCap.getFields(),
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
