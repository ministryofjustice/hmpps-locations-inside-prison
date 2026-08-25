import FormWizard from 'hmpo-form-wizard'
import ChangeCellType from '../../controllers/changeCellType'
import paths from '../../utils/paths'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedLocation),
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
