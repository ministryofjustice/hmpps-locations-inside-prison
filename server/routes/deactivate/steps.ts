import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import DeactivatePermanentConfirm from '../../controllers/deactivate/permanent/confirm'
import DeactivateTemporaryConfirm from '../../controllers/deactivate/temporary/confirm'
import DeactivateTemporaryDetails from '../../controllers/deactivate/temporary/details'
import CertChangeDisclaimer from '../../commonTransactions/certChangeDisclaimer'
import capFirst from '../../formatters/capFirst'
import SubmitCertificationApprovalRequest from '../../commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCap from '../../commonTransactions/updateSignedOpCap'
import TemporaryInactiveInit from '../../controllers/deactivate/temporaryInactiveInit'
import paths from '../../utils/paths'
import FormStep from '../../controllers/base/formStep'
import DeactivatePermanentBase from '../../controllers/deactivate/permanent/base'

function isCellOccupied(_req: FormWizard.Request, res: Response) {
  return res.locals.prisonerLocation?.prisoners?.length > 0
}

export function hasCertifiedWorkingCapacity(_req: FormWizard.Request, res: Response) {
  return (res.locals.decoratedLocation.currentCellCertificate?.workingCapacity || 0) > 0
}

function canRequestCertChange(req: FormWizard.Request, res: Response) {
  const { prisonConfiguration } = res.locals

  return (
    prisonConfiguration.certificationApprovalRequired === 'ACTIVE' && req.canAccess('certificate_change_request_create')
  )
}

export function isCellCertChange(req: FormWizard.Request, res: Response) {
  const { decoratedLocation } = res.locals

  return (
    canRequestCertChange(req, res) &&
    decoratedLocation.raw.locationType === 'CELL' &&
    req.sessionModel.get<string>('reduceWorkingCapacity') !== 'NO'
  )
}

export function isCertChange(req: FormWizard.Request, res: Response) {
  const { decoratedLocation } = res.locals

  return (
    canRequestCertChange(req, res) &&
    (decoratedLocation.raw.locationType !== 'CELL' || req.sessionModel.get<string>('reduceWorkingCapacity') === 'YES')
  )
}

function permanentDeactivationForbidden(req: FormWizard.Request, _res: Response) {
  return !req.canAccess('deactivate:permanent')
}

const steps: FormWizard.Steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    backLink: (_req, res) => paths.location.view(res.locals.decoratedLocation),
    next: [
      { fn: isCellOccupied, next: 'occupied' },
      {
        fn: (_req, res) =>
          res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE' &&
          res.locals.decoratedLocation.status === 'INACTIVE',
        next: 'temporary-inactive-init',
      },
      {
        fn: (req, res) =>
          (isCellCertChange(req, res) || isCertChange(req, res)) && !hasCertifiedWorkingCapacity(req, res),
        next: 'temporary/details',
      },
      { fn: isCellCertChange, next: 'cell-cert-change' },
      { fn: isCertChange, next: 'cert-change-disclaimer' },
      { fn: permanentDeactivationForbidden, next: 'temporary/details' },
      'type',
    ],
  },
  '/cell-cert-change': {
    fields: ['reduceWorkingCapacity'],
    next: [{ field: 'reduceWorkingCapacity', value: 'YES', next: 'cert-change-disclaimer' }, 'temporary/details'],
    controller: FormStep,
    pageTitle: 'Does the cell’s certified working capacity need to be decreased to 0 on the cell certificate?',
  },
  '/temporary-inactive-init': {
    skip: true,
    controller: TemporaryInactiveInit,
    next: 'cert-change-disclaimer',
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
    pageTitle: 'Do you want to deactivate this location temporarily or permanently?',
    template: '../../partials/formStep',
    controller: FormStep,
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
      'workingCapacityExplanation',
    ],
    next: [
      {
        fn: (req, res) => isCellCertChange(req, res) && hasCertifiedWorkingCapacity(req, res),
        next: 'submit-certification-approval-request',
      },
      {
        fn: (req, res) => isCertChange(req, res) && hasCertifiedWorkingCapacity(req, res),
        next: 'update-signed-op-cap',
      },
      'temporary/confirm',
    ],
    controller: DeactivateTemporaryDetails,
    pageTitle: 'Deactivation details',
    template: '../../partials/formStep',
  },
  ...UpdateSignedOpCap.getSteps({ next: 'submit-certification-approval-request' }),
  ...SubmitCertificationApprovalRequest.getSteps({ next: '#' }),
  '/temporary/confirm': {
    fields: ['confirm'],
    controller: DeactivateTemporaryConfirm,
    pageTitle: 'Check your answers before deactivating this location',
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
    controller: DeactivatePermanentBase,
  },
  '/permanent/details': {
    fields: ['permanentDeactivationReason'],
    next: 'permanent/confirm',
    controller: DeactivatePermanentBase,
    pageTitle: 'Permanent deactivation details',
    template: '../../partials/formStep',
  },
  '/permanent/confirm': {
    fields: ['confirm'],
    controller: DeactivatePermanentConfirm,
    pageTitle: 'You are permanently deactivating this location',
  },
  '/occupied': {
    checkJourney: false,
    controller: FormStep,
    pageTitle: "You can't deactivate this location as it is currently occupied",
  },
}

export default steps
