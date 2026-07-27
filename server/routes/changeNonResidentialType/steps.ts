import FormWizard from 'hmpo-form-wizard'
import ChangeNonResidentialTypeDetails from '../../controllers/changeNonResidentialType/details'
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
    fields: ['convertedCellType', 'otherConvertedCellType'],
    controller: ChangeNonResidentialTypeDetails,
    pageTitle: 'Change non-residential room type',
    template: '../../partials/formStep',
  },
}

export default steps
