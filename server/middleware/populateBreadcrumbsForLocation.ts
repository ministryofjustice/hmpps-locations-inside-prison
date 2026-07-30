import paths from '../utils/paths'
import middleware from './middleware'
import addBreadcrumb from './addBreadcrumb'

const populateBreadcrumbsForLocation = middleware((req, res, next?) => {
  const { topLevelLocationType, locationHierarchy, prisonId } = res.locals

  if (topLevelLocationType && locationHierarchy) {
    addBreadcrumb({
      title: topLevelLocationType,
      href: paths.location.view(prisonId),
    })(req, res)

    locationHierarchy.forEach(l => {
      addBreadcrumb({ title: l.localName || l.code, href: paths.location.view(prisonId, l.id) })(req, res)
    })
  }

  if (next) {
    next()
  }
})

export default populateBreadcrumbsForLocation
