import FormWizard from 'hmpo-form-wizard'
import SetCellType from '../../controllers/setCellType'
import FormInitialStep from '../../controllers/base/formInitialStep'

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'type',
  },
  '/type': {
    // add code to display the 'Is it a normal or special cell type?' step here
    pageTitle: 'Is it a normal or special cell type?',
    fields: ['accommodationType'],
    next: [{ field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: 'normal' }, 'special'],
  },
  '/normal': {
    pageTitle: 'Select normal cell type',
    template: '../../setCellType/normal',
    fields: ['normalCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
  '/special': {
    pageTitle: 'Select special cell type',
    template: '../../setCellType/special',
    fields: ['specialistCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },

  // '/details': {
  //   fields: ['locationCode'],
  //   controller: Details,
  //   template: '../../partials/formStep',
  // },
}

export default steps
