import express from 'express'
import wizard from 'hmpo-form-wizard'
import steps from './steps'
import fields from './fields'
import populateLocation from '../../middleware/populateLocation'
import protectRoute from '../../middleware/protectRoute'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import populatePrisonConfiguration from '../../middleware/populatePrisonConfiguration'
import middleware from '../../middleware/middleware'

const router = express.Router({ mergeParams: true })

const redirectIfOccupied = middleware((req, res, next) => {
  if (res.locals.prisonerLocation?.prisoners?.length > 0 && req.path !== '/occupied') {
    res.redirect(`/location/${res.locals.decoratedLocation.id}/non-residential-conversion/occupied`)
    return
  }

  next()
})

router.use(
  protectRoute('convert_non_residential'),
  populateLocation({ decorate: true }),
  populatePrisonConfiguration(),
  populatePrisonersInLocation(),
  redirectIfOccupied,
  wizard(steps, fields, {
    name: 'non-residential-conversion',
    templatePath: 'pages/nonResidentialConversion',
    csrf: false,
  }),
)

export default router
