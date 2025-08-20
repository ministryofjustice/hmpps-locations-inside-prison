import FormWizard from 'hmpo-form-wizard'
import RemoveCellType from './removeCellType'

const steps: FormWizard.Steps = {
  '/:cellId': {
    entryPoint: true,
    skip: true,
    controller: RemoveCellType,
  },
}

export default steps
