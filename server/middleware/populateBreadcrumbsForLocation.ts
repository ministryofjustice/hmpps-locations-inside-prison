import asyncMiddleware from './asyncMiddleware'

const populateBreadcrumbsForLocation = asyncMiddleware((req, res, next) => {
  const { breadcrumbs, topLevelLocationType, locationHierarchy, prisonId } = res.locals

  if (topLevelLocationType && locationHierarchy && prisonId) {
    breadcrumbs.push({
      title: topLevelLocationType,
      href: `/view-and-update-locations/${prisonId}`,
    })

    breadcrumbs.push(
      ...locationHierarchy.map(l => {
        return { title: l.localName || l.code, href: `/view-and-update-locations/${l.prisonId}/${l.id}` }
      }),
    )
  }

  next()
})

export default populateBreadcrumbsForLocation
