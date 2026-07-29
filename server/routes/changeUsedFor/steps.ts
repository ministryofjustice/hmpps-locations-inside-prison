import FormWizard from 'hmpo-form-wizard'
import ChangeUsedFor from '../../controllers/changeUsedFor/details'
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
    fields: ['usedFor'],
    controller: ChangeUsedFor,
    pageTitle: 'Change what the location is used for',
  },
}

export default steps
