import FormWizard from 'hmpo-form-wizard'
import SetCellType from './setCellType'
import FormInitialStep from '../../controllers/base/formInitialStep'

const steps: FormWizard.Steps = {
  '/:cellId': {
    entryPoint: true,
    skip: true,
    controller: FormInitialStep,
    next: ':cellId/type',
  },
  '/:cellId/type': {
    pageTitle: 'Is it a normal or special cell type?',
    fields: ['accommodationType'],
    next: [
      { field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: ':cellId/normal' },
      ':cellId/special',
    ],
  },
  '/:cellId/normal': {
    pageTitle: 'Select normal cell type',
    template: '../../commonTransactions/setCellType/normal',
    fields: ['normalCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
  '/:cellId/special': {
    pageTitle: 'Select special cell type',
    template: '../../commonTransactions/setCellType/special',
    fields: ['specialistCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
}

export default steps
