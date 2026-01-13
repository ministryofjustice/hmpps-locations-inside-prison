import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import DeactivatePermanentConfirm from '../../controllers/deactivate/permanent/confirm'
import DeactivatePermanentDetails from '../../controllers/deactivate/permanent/details'
import DeactivatePermanentWarning from '../../controllers/deactivate/permanent/warning'
import DeactivateTemporaryConfirm from '../../controllers/deactivate/temporary/confirm'
import DeactivateTemporaryDetails from '../../controllers/deactivate/temporary/details'
import DeactivateOccupied from '../../controllers/deactivate/occupied'
import DeactivateType from '../../controllers/deactivate/type'
import CellCertChange from '../../controllers/deactivate/cell-cert-change'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'

function isCellOccupied(req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

function showCellCertChange(_req: FormWizard.Request, res: Response) {
  const { prisonConfiguration, decoratedLocation } = res.locals

  return prisonConfiguration.certificationApprovalRequired === 'ACTIVE' && decoratedLocation.raw.locationType === 'CELL'
}

function permanentDeactivationForbidden(req: FormWizard.Request, res: Response) {
  return !req.canAccess('deactivate:permanent')
}

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.prisonId, res.locals.locationId].filter(i => i).join('/')}`,
    next: [
      { fn: isCellOccupied, next: 'occupied' },
      { fn: permanentDeactivationForbidden, next: 'temporary/details' },
      { fn: showCellCertChange, next: 'cell-cert-change' },
      'type',
    ],
  },
  '/cell-cert-change': {
    fields: ['reduceWorkingCapacity'],
    next: [{ field: 'reduceWorkingCapacity', value: 'YES', next: 'cert-change-disclaimer' }, 'temporary/details'],
    controller: CellCertChange,
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'cert-change-disclaimer',
    title: (_req, _res) => `Decreasing certified working capacity`,
    caption: (_req, res) => `${capFirst(res.locals.decoratedLocation.displayName)}`,
  }),
  '/type': {
    fields: ['deactivationType'],
    next: [{ field: 'deactivationType', value: 'temporary', next: 'temporary/details' }, 'permanent/warning'],
    controller: DeactivateType,
    template: '../../partials/formStep',
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
    template: '../../partials/formStep',
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
    template: '../../partials/formStep',
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
