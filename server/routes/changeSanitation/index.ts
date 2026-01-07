import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import protectRoute from '../../middleware/protectRoute'
import populateDecoratedResidentialSummary from '../../middleware/populateDecoratedResidentialSummary'
import populatePrisonAndLocationId from '../../middleware/populatePrisonAndLocationId'
import asyncMiddleware from '../../middleware/asyncMiddleware'

const router = express.Router({ mergeParams: true })

const checkLocationIsDraft = asyncMiddleware(async (_req, res, next) => {
  if (res.locals.decoratedResidentialSummary.location.status !== 'DRAFT') {
    throw new Error()
  }

  next()
})

router.use(
  protectRoute('change_sanitation'),
  populatePrisonAndLocationId,
  populateDecoratedResidentialSummary,
  checkLocationIsDraft,
  wizard(steps, fields, {
    name: 'change-sanitation',
    templatePath: 'pages/changeSanitation',
    csrf: false,
  }),
)

export default router
