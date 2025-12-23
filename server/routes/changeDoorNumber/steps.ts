import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeDoorNumber/details'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['doorNumber'],
    controller: Details,
    template: '../../partials/formStep',
    pageTitle: 'Change door number',
  },
}

export default steps
