import middleware from './middleware'
import capFirst from '../formatters/capFirst'

export default middleware((_req, res, next) => {
  const { decoratedLocation, location } = res.locals

  if (decoratedLocation) {
    res.locals.titleCaption = capFirst(decoratedLocation.displayName)
  } else if (location) {
    res.locals.titleCaption = `${capFirst(location.locationType.toLowerCase())} ${location.localName || location.pathHierarchy}`
  }

  next()
})
