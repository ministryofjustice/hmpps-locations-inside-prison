import FormWizard from 'hmpo-form-wizard'
import SetCellType from './setCellType'
import FormInitialStep from '../../controllers/base/formInitialStep'
import BaseController from './baseController'

const steps: FormWizard.Steps = {
  '/init': {
    entryPoint: true,
    skip: true,
    controller: FormInitialStep,
    next: 'type',
  },
  '/type': {
    pageTitle: 'Is it a normal or special cell type?',
    fields: ['accommodationType'],
    controller: BaseController,
    next: [{ field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: 'normal' }, 'special'],
  },
  '/normal': {
    pageTitle: 'Select normal cell type',
    template: '../../commonTransactions/setCellType/normal',
    fields: ['normalCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
  '/special': {
    pageTitle: 'Select special cell type',
    template: '../../commonTransactions/setCellType/special',
    fields: ['specialistCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
}

export default steps
