import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeLocationCode/details'

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
    fields: ['locationCode'],
    controller: Details,
    template: '../../partials/formStep',
  },
}

export default steps
