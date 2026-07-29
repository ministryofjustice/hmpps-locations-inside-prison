import FormWizard from 'hmpo-form-wizard'
import CreateCells from '../../commonTransactions/createCells'
import EditCellsInit from '../../controllers/editCells/init'
import EditCellsConfirm from '../../controllers/editCells/confirm'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedResidentialSummary.location),
    reset: true,
    resetJourney: true,
    checkJourney: false, // history manually set
    skip: true,
    controller: EditCellsInit,
    next: 'confirm',
  },
  ...CreateCells.getSteps({
    next: 'confirm',
  }),
  '/confirm': {
    controller: EditCellsConfirm,
    pageTitle: 'Edit cells',
  },
}

export default steps
