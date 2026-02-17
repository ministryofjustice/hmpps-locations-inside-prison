import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../../middleware/populateLocation'
import protectRoute from '../../../middleware/protectRoute'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import populatePrisonConfiguration from '../../../middleware/populatePrisonConfiguration'

const router = express.Router({ mergeParams: true })

const checkIsInactive = asyncMiddleware(async (_req, res, next) => {
  const { status } = res.locals.decoratedLocation.raw
  if (status !== 'INACTIVE') {
    throw new Error(`LOCATION NOT INACTIVE: ${status}`)
  }

  next()
})

router.use(
  protectRoute('reactivate'),
  populateLocation({ decorate: true }),
  populatePrisonConfiguration(),
  checkIsInactive,
  wizard(steps, fields, {
    name: 'reactivate',
    templatePath: 'pages/reactivate/location',
    csrf: false,
  }),
)

export default router
