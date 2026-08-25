import middleware from './middleware'
import capFirst from '../formatters/capFirst'

export default middleware((_req, res, next) => {
  const { decoratedLocation, decoratedResidentialSummary, location, prisonResidentialSummary } = res.locals

  if (decoratedLocation) {
    res.locals.titleCaption = capFirst(decoratedLocation.displayName)
  } else if (location) {
    res.locals.titleCaption = `${capFirst(location.locationType.toLowerCase())} ${location.localName || location.pathHierarchy}`
  } else if (decoratedResidentialSummary) {
    res.locals.titleCaption = capFirst(decoratedResidentialSummary.location.displayName)
  } else if (prisonResidentialSummary?.prisonSummary) {
    res.locals.titleCaption = prisonResidentialSummary.prisonSummary.prisonName
  }

  next()
})
