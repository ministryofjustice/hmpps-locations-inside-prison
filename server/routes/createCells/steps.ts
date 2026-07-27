import FormWizard from 'hmpo-form-wizard'
import CreateCells from '../../commonTransactions/createCells'
import CreateCellsInit from '../../controllers/createCells/init'
import ConfirmCreateCells from '../../controllers/createCells/confirm'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedResidentialSummary.location),
    reset: true,
    resetJourney: true,
    skip: true,
    controller: CreateCellsInit,
    next: 'create-cells/details',
  },
  ...CreateCells.getSteps({
    next: 'confirm',
  }),
  '/confirm': {
    controller: ConfirmCreateCells,
    pageTitle: 'Check and confirm the cell details',
  },
}

export default steps
