import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import middleware from '../../middleware/middleware'
import paths from '../../utils/paths'
import populateTitleCaptionFromLocationOrPrison from '../../middleware/populateTitleCaptionFromLocationOrPrison'

const router = express.Router({ mergeParams: true })

const redirectIfOccupied = middleware((req, res, next) => {
  if (res.locals.prisonerLocation?.prisoners?.length > 0 && req.path !== '/occupied') {
    res.redirect(`${paths.location.nonResidentialConversion(res.locals.decoratedLocation)}/occupied`)
    return
  }

  next()
})

router.use(
  protectRoute('convert_non_residential'),
  populateLocation({ decorate: true }),
  populateTitleCaptionFromLocationOrPrison,
  populatePrisonersInLocation(),
  redirectIfOccupied,
  wizard(steps, fields, {
    name: 'non-residential-conversion',
    templatePath: 'pages/nonResidentialConversion',
    csrf: false,
  }),
)

export default router
