import FormWizard from 'hmpo-form-wizard'
import Init from './init'

const steps: FormWizard.Steps = {
  '/:cellId': {
    entryPoint: true,
    skip: true,
    controller: Init,
    next: ':cellId/type',
  },
  '/:cellId/type': {
    pageTitle: 'Is this a normal or special accommodation cell type?',
    fields: ['accommodationType'],
    next: [{ field: 'accommodationType', op: '==', value: 'normal', next: ':cellId/normal' }, ':cellId/special'],
  },
  '/:cellId/normal': {
    pageTitle: 'Select normal accommodation cell type',
    next: '$END_OF_TRANSACTION$',
  },
  '/:cellId/special': {
    pageTitle: 'Select special accommodation cell type',
    template: '../../commonTransactions/setCellType/special',
    next: '$END_OF_TRANSACTION$',
  },
}

export default steps
