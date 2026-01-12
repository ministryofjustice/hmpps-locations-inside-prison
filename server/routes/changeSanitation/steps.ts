import FormWizard from 'hmpo-form-wizard'
import Details from '../../controllers/changeSanitation/details'

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
    fields: ['inCellSanitation'],
    controller: Details,
    template: '../../partials/formStep',
    pageTitle: 'Does the cell have in-cell sanitation?',
  },
}

export default steps
