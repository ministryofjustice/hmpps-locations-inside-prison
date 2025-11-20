import FormWizard from 'hmpo-form-wizard'
import CreateCells from '../../commonTransactions/createCells'

const fields: FormWizard.Fields = {
  ...CreateCells.getFields(),
}

export default fields
