import FormWizard from 'hmpo-form-wizard'
import SetCellType from './setCellType'
import SetCellTypeWithCertChange from './setCellTypeWithCertChange'
import FormInitialStep from '../../controllers/base/formInitialStep'
import BaseController from './baseController'
import CertChangeDisclaimer from '../certChangeDisclaimer'
import ReviewCellCapacity from '../../controllers/setCellType/review'
import SubmitCertificationApprovalRequest from '../submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../updateSignedOpCap'
import isCellTypeCertChange from './isCellTypeCertChange'

const commonSteps = {
  '/init': {
    entryPoint: true,
    skip: true,
    controller: FormInitialStep,
    next: 'type',
  },
  '/normal': {
    pageTitle: 'Select normal cell type',
    template: 'setCellType/normal',
    fields: ['normalCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
}

const steps: FormWizard.Steps = {
  ...commonSteps,
  '/type': {
    pageTitle: 'Is it a normal or special cell type?',
    fields: ['accommodationType'],
    controller: BaseController,
    next: [{ field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: 'normal' }, 'special'],
  },
  '/special': {
    pageTitle: 'Select special cell type',
    template: 'setCellType/special',
    fields: ['specialistCellTypes'],
    controller: SetCellType,
    next: '$END_OF_TRANSACTION$',
  },
}

const stepsWithCertChange: FormWizard.Steps = {
  ...commonSteps,
  '/type': {
    pageTitle: 'Is it a normal or special cell type?',
    fields: ['accommodationType'],
    controller: BaseController,
    next: [
      { field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: 'normal' },
      {
        fn: isCellTypeCertChange,
        next: 'cert-change-disclaimer',
      },
      'special',
    ],
  },
  ...CertChangeDisclaimer.getSteps({
    next: [{ field: 'accommodationType', op: '==', value: 'NORMAL_ACCOMMODATION', next: 'normal' }, 'special'],
    title: (_req, _res) => 'Setting special cell type',
    caption: (_req, res) => res.locals.prisonResidentialSummary?.prisonSummary?.prisonName,
  }),
  '/special': {
    pageTitle: 'Select special cell type',
    template: 'setCellType/special',
    fields: ['specialistCellTypes'],
    controller: SetCellTypeWithCertChange,
    next: [
      {
        fn: isCellTypeCertChange,
        next: 'review',
      },
      '$END_OF_TRANSACTION$',
    ],
  },
  '/review': {
    fields: ['baselineCna', 'workingCapacity', 'maxCapacity'],
    controller: ReviewCellCapacity,
    next: 'update-signed-op-cap',
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export { steps, stepsWithCertChange }
