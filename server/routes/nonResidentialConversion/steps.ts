import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import NonResidentialConversionOccupied from '../../controllers/nonResidentialConversion/occupied'
import NonResidentialConversionWarning from '../../controllers/nonResidentialConversion/warning'
import NonResidentialConversionDetails from '../../controllers/nonResidentialConversion/details'
import NonResidentialConversionConfirm from '../../controllers/nonResidentialConversion/confirm'

function isCellOccupied(req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: isCellOccupied,
        next: 'occupied',
      },
      'warning',
    ],
  },
  '/occupied': {
    controller: NonResidentialConversionOccupied,
    checkJourney: false,
  },
  '/warning': {
    controller: NonResidentialConversionWarning,
    next: 'details',
  },
  '/details': {
    fields: ['convertedCellType', 'otherConvertedCellType'],
    controller: NonResidentialConversionDetails,
    next: 'confirm',
  },
  '/confirm': {
    controller: NonResidentialConversionConfirm,
  },
}

export default steps
