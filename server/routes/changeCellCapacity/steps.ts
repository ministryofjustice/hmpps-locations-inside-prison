import FormWizard from 'hmpo-form-wizard'
import ChangeCellCapacity from '../../controllers/changeCellCapacity'
import ConfirmCellCapacity from '../../controllers/changeCellCapacity/confirm'
import canEditCna from '../../utils/canEditCna'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'change',
  },
  '/change': {
    fields: ['baselineCna', 'workingCapacity', 'maxCapacity'],
    next: [
      {
        fn: (_req, res) => canEditCna(res.locals.prisonConfiguration, res.locals.decoratedLocation),
        next: 'confirm-skip',
      },
      'confirm',
    ],
    controller: ChangeCellCapacity,
    template: '../../partials/formStep',
  },
  '/confirm': {
    controller: ConfirmCellCapacity,
  },
  '/confirm-skip': {
    controller: ConfirmCellCapacity,
    skip: true,
  },
}

export default steps
