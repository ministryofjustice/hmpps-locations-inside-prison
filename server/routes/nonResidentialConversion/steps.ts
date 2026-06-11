import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import NonResidentialConversionOccupied from '../../controllers/nonResidentialConversion/occupied'
import NonResidentialConversionWarning from '../../controllers/nonResidentialConversion/warning'
import NonResidentialConversionDetails from '../../controllers/nonResidentialConversion/details'
import NonResidentialConversionConfirm from '../../controllers/nonResidentialConversion/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import isCertActiveAndNotDraft from '../../utils/isCertActiveAndNotDraft'

function isCellOccupied(_req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

function hasCertApprovalSteps(req: FormWizard.Request, res: Response) {
  return req.featureFlags.nonResiConversionCertified && isCertActiveAndNotDraft(res.locals)
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
    next: [
      {
        fn: isCellOccupied,
        next: 'occupied',
      },
      'details',
    ],
    title: (_req, _res) => `Converting a cell to a non-residential room`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)}`,
  }),
  '/occupied': {
    controller: NonResidentialConversionOccupied,
    checkJourney: false,
  },
  '/warning': {
    controller: NonResidentialConversionWarning,
    next: 'details',
    buttonClasses: 'govuk-button--secondary',
  },
  '/details': {
    fields: ['convertedCellType', 'otherConvertedCellType', 'explanation'],
    controller: NonResidentialConversionDetails,
    next: 'confirm',
    template: '../../partials/formStep',
  },
  '/confirm': {
    controller: NonResidentialConversionConfirm,
  },
}

export default steps
