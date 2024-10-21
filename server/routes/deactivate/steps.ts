import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import DeactivatePermanentConfirm from '../../controllers/deactivate/permanent/confirm'
import DeactivatePermanentDetails from '../../controllers/deactivate/permanent/details'
import DeactivatePermanentWarning from '../../controllers/deactivate/permanent/warning'
import DeactivateTemporaryConfirm from '../../controllers/deactivate/temporary/confirm'
import DeactivateTemporaryDetails from '../../controllers/deactivate/temporary/details'
import DeactivateOccupied from '../../controllers/deactivate/occupied'
import DeactivateType from '../../controllers/deactivate/type'

function isCellOccupied(req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

function permanentDeactivationForbidden(req: FormWizard.Request, res: Response) {
  return !req.canAccess('deactivate:permanent')
}

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      { fn: isCellOccupied, next: 'occupied' },
      { fn: permanentDeactivationForbidden, next: 'temporary/details' },
      'type',
    ],
  },
  '/type': {
    fields: ['deactivationType'],
    next: [{ field: 'deactivationType', value: 'temporary', next: 'temporary/details' }, 'permanent/warning'],
    controller: DeactivateType,
  },
  '/temporary': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [{ fn: isCellOccupied, next: 'occupied' }, 'temporary/details'],
  },
  '/temporary/details': {
    fields: ['deactivationReason', 'estimatedReactivationDate', 'planetFmReference'],
    next: 'temporary/confirm',
    controller: DeactivateTemporaryDetails,
  },
  '/temporary/confirm': {
    fields: ['confirm'],
    controller: DeactivateTemporaryConfirm,
  },
  '/permanent': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [{ fn: isCellOccupied, next: 'occupied' }, 'permanent/warning'],
  },
  '/permanent/warning': {
    next: 'permanent/details',
    controller: DeactivatePermanentWarning,
  },
  '/permanent/details': {
    fields: ['permanentDeactivationReason'],
    next: 'permanent/confirm',
    controller: DeactivatePermanentDetails,
  },
  '/permanent/confirm': {
    fields: ['confirm'],
    controller: DeactivatePermanentConfirm,
  },
  '/occupied': {
    checkJourney: false,
    controller: DeactivateOccupied,
  },
}

export default steps
