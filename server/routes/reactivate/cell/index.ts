import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../../middleware/populateLocation'
import protectRoute from '../../../middleware/protectRoute'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

const router = express.Router({ mergeParams: true })

const checkSupportedLocationType = asyncMiddleware(async (req, res, next) => {
  const { locationType } = res.locals.location.raw
  if (!['CELL'].includes(locationType)) {
    throw new Error(`UNSUPPORTED LOCATION TYPE: ${locationType}`)
  }

  next()
})

router.use(
  protectRoute('reactivate'),
  populateLocation({ decorate: true }),
  checkSupportedLocationType,
  wizard(steps, fields, {
    name: 'reactivate',
    templatePath: 'pages/reactivate/cell',
    csrf: false,
  }),
)

export default router
