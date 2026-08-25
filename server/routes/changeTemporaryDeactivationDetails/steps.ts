import FormWizard from 'hmpo-form-wizard'
import ChangeTemporaryDeactivationDetails from '../../controllers/changeTemporaryDeactivationDetails/details'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
    backLink: (_req, res) => paths.location.view(res.locals.decoratedLocation),
  },
  '/details': {
    fields: ['deactivationReason', 'estimatedReactivationDate', 'planetFmReference'],
    controller: ChangeTemporaryDeactivationDetails,
    pageTitle: 'Deactivation details',
    template: '../../partials/formStep',
  },
}

export default steps
