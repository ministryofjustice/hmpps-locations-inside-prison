import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import Details from './details'
import IsUpdateNeeded from './isUpdateNeeded'
import IsUnderReview from './isUnderReview'
import CertChangeDisclaimer from '../certChangeDisclaimer'

const steps: FormWizard.Steps = {
  '/': {
    skip: true,
    controller: BaseController,
    next: ['is-update-needed'],
  },
  '/is-update-needed': {
    pageTitle: "Check the establishment's signed operational capacity",
    fields: ['isUpdateNeeded'],
    template: 'updateSignedOpCap/isUpdateNeeded',
    controller: IsUpdateNeeded,
    next: [
      {
        field: 'isUpdateNeeded',
        op: '==',
        value: 'YES',
        next: [{ fn: (_req, res) => !!res.locals.signedOpCapChangeRequest, next: 'already-requested' }, 'details'],
      },
      '$END_OF_TRANSACTION$',
    ],
  },
  '/is-under-review': {
    controller: IsUnderReview,
    skip: true,
    next: [
      { fn: (_req, res) => !!res.locals.signedOpCapChangeRequest, next: 'already-requested' },
      'cert-change-disclaimer',
    ],
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'details',
    title: (_req, _res) => `Update the signed operational capacity`,
    caption: (req, res) => res.locals.titleCaption, // FIXME: not working
  }),
  '/already-requested': {
    pageTitle: 'A change to the signed operational capacity has already been requested',
    template: 'updateSignedOpCap/alreadyRequested',
    controller: BaseController,
    next: '$END_OF_TRANSACTION$',
  },
  '/details': {
    pageTitle: 'Update the signed operational capacity',
    fields: ['currentSignedOpCap', 'newSignedOpCap', 'explanation'],
    controller: Details,
    next: [
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'submit-certification-approval-request' },
      '$END_OF_TRANSACTION$',
    ],
  },
}

export default steps
