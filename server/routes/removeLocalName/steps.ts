import FormWizard from 'hmpo-form-wizard'
import removeLocalName from '../../controllers/removeLocalName/check'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    controller: removeLocalName,
    buttonClasses: 'govuk-button--warning',
  },
}

export default steps
