import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeLocationCode/details'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedResidentialSummary.location),
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['locationCode'],
    controller: Details,
    template: '../../partials/formStep',
  },
}

export default steps
