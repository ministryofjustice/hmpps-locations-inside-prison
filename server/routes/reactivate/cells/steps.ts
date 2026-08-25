import FormWizard from 'hmpo-form-wizard'
import ReactivateCellsInit from '../../../controllers/reactivate/cells/init'
import ReactivateCellsCheckCapacity from '../../../controllers/reactivate/cells/checkCapacity'
import ReactivateCellsChangeCapacity from '../../../controllers/reactivate/cells/changeCapacity'
import ReactivateCellsConfirm from '../../../controllers/reactivate/cells/confirm'
import paths from '../../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    controller: ReactivateCellsInit,
    next: 'check-capacity',
    backLink: (_req, res) => paths.location.view(res.locals.prisonId, res.locals.locationId),
  },
  '/check-capacity': {
    controller: ReactivateCellsCheckCapacity,
    pageTitle: 'Check capacity of cells',
    next: 'confirm',
  },
  '/change-capacity/:locationId': {
    checkJourney: false,
    controller: ReactivateCellsChangeCapacity,
    pageTitle: 'Change cell capacity',
    fields: ['workingCapacity', 'maxCapacity'],
    next: 'check-capacity',
    template: '../../../partials/formStep',
  },
  '/confirm': {
    controller: ReactivateCellsConfirm,
  },
}

export default steps
