import FormWizard from 'hmpo-form-wizard'
import ChangeCellType from '../../controllers/changeCellType'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'change',
  },
  '/change': {
    pageTitle: 'Select normal cell type',
    fields: ['specialistCellTypes'],
    template: 'formStep',
    controller: ChangeCellType,
  },
}

export default steps
