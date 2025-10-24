import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/setLocalName/details'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['localName'],
    controller: Details,
    template: '../../partials/formStep',
  },
}

export default steps
