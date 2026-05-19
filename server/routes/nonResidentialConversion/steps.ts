import FormWizard from 'hmpo-form-wizard'
import NonResidentialConversionOccupied from '../../controllers/nonResidentialConversion/occupied'
import NonResidentialConversionWarning from '../../controllers/nonResidentialConversion/warning'
import NonResidentialConversionDetails from '../../controllers/nonResidentialConversion/details'
import NonResidentialConversionConfirm from '../../controllers/nonResidentialConversion/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'

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
        fn: (_req, res) => res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE',
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
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
  '/confirm': {
    controller: NonResidentialConversionConfirm,
  },
}

export default steps
