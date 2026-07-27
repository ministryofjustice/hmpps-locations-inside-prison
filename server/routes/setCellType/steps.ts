import FormWizard from 'hmpo-form-wizard'
import SetCellType from '../../commonTransactions/setCellType'
import SetCellTypeController from '../../controllers/setCellType'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedLocation),
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'set-cell-type/init',
  },
  ...new SetCellType({ includeCertificationSteps: true }).getSteps({ next: 'save' }),
  '/save': {
    controller: SetCellTypeController,
    skip: true,
  },
}

export default steps
