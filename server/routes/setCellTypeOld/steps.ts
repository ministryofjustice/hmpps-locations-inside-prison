import FormWizard from 'hmpo-form-wizard'
import SetCellType from '../../controllers/setCellType'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'change',
  },
  '/change': {
    fields: ['specialistCellTypes'],
    controller: SetCellType,
  },
}

export default steps
