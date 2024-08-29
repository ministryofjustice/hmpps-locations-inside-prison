import asyncMiddleware from './asyncMiddleware'
import { Location } from '../data/types/locationsApi'

const populateBreadcrumbsForLocation = asyncMiddleware((req, res, next) => {
  const { breadcrumbs, topLevelLocationType, locationHierarchy, prisonId } = res.locals

  if (topLevelLocationType && locationHierarchy && prisonId) {
    breadcrumbs.push({
      title: topLevelLocationType,
      href: `/view-and-update-locations/${prisonId}`,
    })

    breadcrumbs.push(
      ...locationHierarchy.map((l: Location) => {
        return { title: l.localName || l.code, href: `/view-and-update-locations/${l.prisonId}/${l.id}` }
      }),
    )
  }

  next()
})

export default populateBreadcrumbsForLocation
