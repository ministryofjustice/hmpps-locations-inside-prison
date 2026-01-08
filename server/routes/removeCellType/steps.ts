import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import RemoveCellType from '../../controllers/removeCellType/remove'
import CheckRemoveCellType from '../../controllers/removeCellType/check'
import ReviewCellCapacity from '../../controllers/removeCellType/review'
import ConfirmRemoveCellType from '../../controllers/removeCellType/confirm'
import canEditCna from '../../utils/canEditCna'

function mustReviewCapacity(_req: FormWizard.Request, res: Response) {
  const { accommodationTypes, active, capacity, certification, status, pendingChanges } = res.locals.location

  let { workingCapacity } = capacity
  let { certifiedNormalAccommodation: cna } = certification

  if (pendingChanges?.certifiedNormalAccommodation !== undefined) {
    cna = pendingChanges.certifiedNormalAccommodation
  }

  if (pendingChanges?.workingCapacity !== undefined) {
    workingCapacity = pendingChanges.workingCapacity
  }

  return (
    (active || status === 'DRAFT') &&
    (workingCapacity === 0 || cna === 0) &&
    accommodationTypes.includes('NORMAL_ACCOMMODATION')
  )
}

const steps: FormWizard.Steps = {
  '/': {
    backLink: (_req, res) =>
      `/view-and-update-locations/${[res.locals.decoratedLocation.prisonId, res.locals.decoratedLocation.id].filter(i => i).join('/')}`,
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: [
      {
        fn: mustReviewCapacity,
        next: 'check',
      },
      'remove',
    ],
  },
  '/remove': {
    controller: RemoveCellType,
    buttonClasses: 'govuk-button--warning',
  },
  '/check': {
    fields: ['areYouSure'],
    controller: CheckRemoveCellType,
    next: 'review',
  },
  '/review': {
    fields: ['baselineCna', 'workingCapacity', 'maxCapacity'],
    controller: ReviewCellCapacity,
    next: [
      {
        fn: (_req, res) => canEditCna(res.locals.prisonConfiguration, res.locals.decoratedLocation),
        next: 'confirm-skip',
      },
      'confirm',
    ],
  },
  '/confirm': {
    controller: ConfirmRemoveCellType,
  },
  '/confirm-skip': {
    controller: ConfirmRemoveCellType,
    skip: true,
  },
}

export default steps
