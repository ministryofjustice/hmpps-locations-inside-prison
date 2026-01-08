import FormWizard from 'hmpo-form-wizard'
import SetCellType from '../../commonTransactions/setCellType'
import SetCellTypeController from '../../controllers/setCellType'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'set-cell-type/init',
  },
  ...SetCellType.getSteps({ next: 'save' }),
  '/save': {
    controller: SetCellTypeController,
    skip: true,
  },
}

export default steps
