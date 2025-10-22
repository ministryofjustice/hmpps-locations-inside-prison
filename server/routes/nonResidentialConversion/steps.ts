import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import NonResidentialConversionOccupied from '../../controllers/nonResidentialConversion/occupied'
import NonResidentialConversionWarning from '../../controllers/nonResidentialConversion/warning'
import NonResidentialConversionDetails from '../../controllers/nonResidentialConversion/details'
import NonResidentialConversionConfirm from '../../controllers/nonResidentialConversion/confirm'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'

function isCellOccupied(_req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
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
        fn: (req, _res) => req.featureFlags.createAndCertify,
        next: 'cert-change-disclaimer',
      },
      {
        fn: isCellOccupied,
        next: 'occupied',
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
      'warning',
    ],
    title: (_req, _res) => `Non-residential conversion`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)} conversion`,
    description: (_req, res) => `converting a cell to non-residential`,
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
    fields: ['convertedCellType', 'otherConvertedCellType'],
    controller: NonResidentialConversionDetails,
    next: 'confirm',
    template: '../../partials/formStep',
  },
  '/confirm': {
    controller: NonResidentialConversionConfirm,
  },
}

export default steps
