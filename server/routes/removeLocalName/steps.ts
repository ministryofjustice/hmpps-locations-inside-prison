import FormWizard from 'hmpo-form-wizard'
import removeLocalName from '../../controllers/removeLocalName/check'
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
    controller: removeLocalName,
    pageTitle: 'Are you sure you want to remove the local name?',
    buttonClasses: 'govuk-button--warning',
  },
}

export default steps
