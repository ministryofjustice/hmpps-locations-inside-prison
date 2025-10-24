import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import RemoveCellType from '../../controllers/removeCellType/remove'
import CheckRemoveCellType from '../../controllers/removeCellType/check'
import ReviewCellCapacity from '../../controllers/removeCellType/review'
import ConfirmRemoveCellType from '../../controllers/removeCellType/confirm'

function mustReviewCapacity(req: FormWizard.Request, res: Response) {
  const { accommodationTypes, active, capacity } = res.locals.location
  return active && capacity?.workingCapacity === 0 && accommodationTypes.includes('NORMAL_ACCOMMODATION')
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
    fields: ['workingCapacity', 'maxCapacity'],
    controller: ReviewCellCapacity,
    next: 'confirm',
  },
  '/confirm': {
    controller: ConfirmRemoveCellType,
  },
}

export default steps
