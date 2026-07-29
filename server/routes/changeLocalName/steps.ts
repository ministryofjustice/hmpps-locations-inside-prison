import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeLocalName/details'
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
    template: '../../partials/formStep',
    pageTitle: 'Change local name',
  },
}

export default steps
