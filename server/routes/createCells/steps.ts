import FormWizard from 'hmpo-form-wizard'
import CreateCells from '../../commonTransactions/createCells'
import CreateCellsInit from '../../controllers/createCells/init'
import ConfirmCreateCells from '../../controllers/createCells/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
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
  },
}

export default steps
