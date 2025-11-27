import FormWizard from 'hmpo-form-wizard'
import CreateCells from '../../commonTransactions/createCells'
import EditCellsInit from '../../controllers/editCells/init'
import EditCellsConfirm from '../../controllers/editCells/confirm'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
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
  },
}

export default steps
