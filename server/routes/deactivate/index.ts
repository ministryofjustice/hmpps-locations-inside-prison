import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'

const router = express.Router({ mergeParams: true })

const checkSupportedLocationType = asyncMiddleware(async (req, res, next) => {
  const { locationType } = res.locals.decoratedLocation.raw
  if (!['CELL', 'ROOM', 'LANDING', 'WING', 'SPUR'].includes(locationType)) {
    throw new Error(`UNSUPPORTED LOCATION TYPE: ${locationType}`)
  }

  next()
})

router.use(
  protectRoute('deactivate'),
  populateLocation({ decorate: true }),
  populatePrisonersInLocation(),
  checkSupportedLocationType,
  wizard(steps, fields, {
    name: 'deactivate',
    templatePath: 'pages/deactivate',
    csrf: false,
  }),
)

export default router
