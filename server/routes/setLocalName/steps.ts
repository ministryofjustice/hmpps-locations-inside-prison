import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/setLocalName/details'
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
    fields: ['localName'],
    controller: Details,
    pageTitle: 'Add local name',
    template: '../../partials/formStepNoTitle',
  },
}

export default steps
