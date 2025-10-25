import FormWizard from 'hmpo-form-wizard'
import ChangeNonResidentialTypeDetails from '../../controllers/changeNonResidentialType/details'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['convertedCellType', 'otherConvertedCellType'],
    controller: ChangeNonResidentialTypeDetails,
    template: '../../partials/formStep',
  },
}

export default steps
