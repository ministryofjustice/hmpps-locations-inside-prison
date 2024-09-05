import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import asyncMiddleware from '../../middleware/asyncMiddleware'

const router = express.Router({ mergeParams: true })

const checkForPrisoners = asyncMiddleware(async (req, res, next) => {
  const { locationId } = req.params
  const redirectUrl = `/location/${locationId}/deactivate/temporary/occupied`
  if (req.originalUrl === redirectUrl) {
    return next()
  }

  const { user } = res.locals
  const token = await req.services.authService.getSystemClientToken(user.username)
  const locations = await req.services.locationsService.getPrisonersInLocation(token, locationId)
  if (locations.find(({ prisoners }) => prisoners?.length)) {
    return res.redirect(redirectUrl)
  }

  return next()
})

const checkSupportedLocationType = asyncMiddleware(async (req, res, next) => {
  const { locationType } = res.locals.location.raw
  if (!['CELL', 'LANDING', 'WING', 'SPUR'].includes(locationType)) {
    throw new Error(`UNSUPPORTED LOCATION TYPE: ${locationType}`)
  }

  next()
})

router.use(
  protectRoute('deactivate_temporary'),
  checkForPrisoners,
  populateLocation(true),
  checkSupportedLocationType,
  wizard(steps, fields, {
    name: 'deactivate-temporary',
    templatePath: 'pages/deactivateTemporary',
    csrf: false,
  }),
)

export default router
