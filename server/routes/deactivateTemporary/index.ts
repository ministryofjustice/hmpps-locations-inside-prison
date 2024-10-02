import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import asyncMiddleware from '../../middleware/asyncMiddleware'

const router = express.Router({ mergeParams: true })

const checkSupportedLocationType = asyncMiddleware(async (req, res, next) => {
  const { locationType } = res.locals.location.raw
  if (!['CELL', 'LANDING', 'WING', 'SPUR'].includes(locationType)) {
    throw new Error(`UNSUPPORTED LOCATION TYPE: ${locationType}`)
  }

  next()
})

router.use(
  protectRoute('deactivate_temporary'),
  populateLocation({ decorate: true }),
  checkSupportedLocationType,
  wizard(steps, fields, {
    name: 'deactivate-temporary',
    templatePath: 'pages/deactivateTemporary',
    csrf: false,
  }),
)

export default router
