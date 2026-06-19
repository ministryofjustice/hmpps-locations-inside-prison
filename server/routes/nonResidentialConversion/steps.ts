import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import NonResidentialConversionOccupied from '../../controllers/nonResidentialConversion/occupied'
import NonResidentialConversionWarning from '../../controllers/nonResidentialConversion/warning'
import NonResidentialConversionDetails from '../../controllers/nonResidentialConversion/details'
import NonResidentialConversionConfirm from '../../controllers/nonResidentialConversion/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import isCertActiveAndNotDraft from '../../utils/isCertActiveAndNotDraft'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'

function isCellOccupied(_req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

function hasCertApprovalSteps(req: FormWizard.Request, res: Response) {
  return isCertActiveAndNotDraft(res.locals)
}

const steps: FormWizard.Steps = {
  '/': {
    backLink: (_req, res) =>
      `/view-and-update-locations/${res.locals.decoratedLocation.prisonId}/${res.locals.decoratedLocation.id}`,
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: isCellOccupied,
        next: 'occupied',
      },
      {
        fn: hasCertApprovalSteps,
        next: 'cert-change-disclaimer',
      },
      'warning',
    ],
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'details',
    title: (_req, _res) => `Converting a cell to a non-residential room`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)}`,
  }),
  '/occupied': {
    backLink: (_req, res) =>
      `/view-and-update-locations/${res.locals.decoratedLocation.prisonId}/${res.locals.decoratedLocation.id}`,
    controller: NonResidentialConversionOccupied,
    entryPoint: true,
    reset: true,
    resetJourney: true,
  },
  '/warning': {
    controller: NonResidentialConversionWarning,
    next: 'details',
    buttonClasses: 'govuk-button--secondary',
  },
  '/details': {
    fields: ['convertedCellType', 'otherConvertedCellType', 'explanation'],
    controller: NonResidentialConversionDetails,
    next: [
      {
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
        next: 'update-signed-op-cap',
      },
      'confirm',
    ],
    template: '../../partials/formStep',
    editable: true,
    editBackStep: 'submit-certification-approval-request',
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  '/confirm': {
    controller: NonResidentialConversionConfirm,
  },
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
}

export default steps
