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
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'

function isCellOccupied(req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

export function isCellCertChange(_req: FormWizard.Request, res: Response) {
  const { prisonConfiguration, decoratedLocation } = res.locals

  return prisonConfiguration.certificationApprovalRequired === 'ACTIVE' && decoratedLocation.raw.locationType === 'CELL'
}

export function isCertChange(req: FormWizard.Request, res: Response) {
  const { prisonConfiguration, decoratedLocation } = res.locals

  return (
    prisonConfiguration.certificationApprovalRequired === 'ACTIVE' &&
    (decoratedLocation.raw.locationType !== 'CELL' || req.sessionModel.get<string>('reduceWorkingCapacity') === 'YES')
  )
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
      { fn: isCellCertChange, next: 'cell-cert-change' },
      { fn: isCertChange, next: 'cert-change-disclaimer' },
      'type',
    ],
  },
  '/cell-cert-change': {
    fields: ['reduceWorkingCapacity'],
    next: [{ field: 'reduceWorkingCapacity', value: 'YES', next: 'cert-change-disclaimer' }, 'temporary/details'],
    controller: CellCertChange,
  },
  ...CertChangeDisclaimer.getSteps({
    next: 'temporary/details',
    title: (_req, res) => {
      const { decoratedLocation } = res.locals

      if (decoratedLocation.raw.locationType === 'CELL') {
        return `Decreasing certified working capacity`
      }

      return `Deactivating a ${decoratedLocation.locationType.toLowerCase()}`
    },
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
    fields: [
      'deactivationReason',
      'estimatedReactivationDate',
      'mandatoryEstimatedReactivationDate',
      'planetFmReference',
      'facilitiesManagementReference',
      'workingCapacityExplanation',
    ],
    next: [
      { fn: isCellCertChange, next: 'submit-certification-approval-request' },
      { fn: isCertChange, next: 'update-signed-op-cap' },
      'temporary/confirm',
    ],
    controller: DeactivateTemporaryDetails,
    template: '../../partials/formStep',
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
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
