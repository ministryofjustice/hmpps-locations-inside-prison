import FormWizard from 'hmpo-form-wizard'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

const fields: FormWizard.Fields = {
  ...SubmitCertificationApprovalRequest.getFields(),
}

export default fields
