import FormWizard from 'hmpo-form-wizard'
import BaseController from './baseController'
import Details from './details'
import IsUpdateNeeded from './isUpdateNeeded'

import CertChangeDisclaimer from '../certChangeDisclaimer'

const steps: FormWizard.Steps = {
  '/': {
    skip: true,
    controller: BaseController,
    next: ['is-update-needed'],
  },
  '/is-under-review': {
    skip: true,
    controller: BaseController,
    next: [
      { fn: (_req, res) => !!res.locals.signedOpCapChangeRequest, next: 'already-requested' },
      'cert-change-disclaimer',
    ],
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
  '/already-requested': {
    pageTitle: 'A change to the signed operational capacity has already been requested',
    template: 'updateSignedOpCap/alreadyRequested',
    controller: BaseController,
    next: '$END_OF_TRANSACTION$',
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'details',
    title: () => 'Changing the signed operational capacity',
    caption: (_req, res) => res.locals.prisonResidentialSummary?.prisonSummary?.prisonName,
  }),
  '/details': {
    pageTitle: 'Update the signed operational capacity',
    fields: ['currentSignedOpCap', 'newSignedOpCap', 'explanation'],
    controller: Details,
  },
}

export default steps
