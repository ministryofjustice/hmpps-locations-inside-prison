import { RequestHandler } from 'express'
import logger from '../../logger'
import { Services } from '../services'
import { Location } from '../data/locationsApiClient'
import formatDaysAgo from '../formatters/formatDaysAgo'
import decorateLocation from '../decorators/location'

export default function populateResidentialSummary({
  authService,
  locationsService,
  manageUsersService,
}: Services): RequestHandler {
  return async (req, res, next) => {
    const { user, prisonId } = res.locals

    try {
      const token = await authService.getSystemClientToken(user.username)

      const apiData = await locationsService.getResidentialSummary(token, prisonId, req.params.locationId)
      const residentialSummary: {
        location?: Location
        locationDetails?: { key: { text: string }; value: { text?: string; html?: string } }[]
        locationHistory?: boolean // TODO: change this type when location history tab is implemented
        subLocationName: string
        subLocations: Location[]
        summaryCards: { type: string; text: string; linkHref?: string; linkLabel?: string }[]
      } = {
        subLocationName: apiData.subLocationName,
        subLocations: await Promise.all(
          apiData.subLocations.map(location => {
            return decorateLocation({
              location,
              locationsService,
              manageUsersService,
              systemToken: token,
              userToken: res.locals.user.token,
              limited: true,
            })
          }),
        ),
        summaryCards: [],
      }

      res.locals.breadcrumbs.push({
        title: apiData.topLevelLocationType,
        href: `/view-and-update-locations/${prisonId}`,
      })
      if (apiData.parentLocation) {
        residentialSummary.location = await decorateLocation({
          location: apiData.parentLocation,
          locationsService,
          manageUsersService,
          systemToken: token,
          userToken: res.locals.user.token,
        })

        residentialSummary.locationDetails = [
          { key: { text: 'Location' }, value: { text: residentialSummary.location.pathHierarchy } },
          ...(!residentialSummary.location.leafLevel
            ? [{ key: { text: 'Local name' }, value: { text: residentialSummary.location.localName } }]
            : []),
          {
            key: { text: 'Accommodation type' },
            value: { html: residentialSummary.location.accommodationTypes.join('<br>') },
          },
          ...(residentialSummary.location.usedFor.length
            ? [{ key: { text: 'Used for' }, value: { html: residentialSummary.location.usedFor.join('<br>') } }]
            : []),
          {
            key: { text: 'Last updated' },
            value: {
              text: `${formatDaysAgo(residentialSummary.location.lastModifiedDate)} by ${residentialSummary.location.lastModifiedBy}`,
            },
          },
        ]

        residentialSummary.locationHistory = true

        if (residentialSummary.location.status !== 'NON_RESIDENTIAL') {
          residentialSummary.summaryCards.push(
            { type: 'working-capacity', text: residentialSummary.location.capacity.workingCapacity.toString() },
            { type: 'maximum-capacity', text: residentialSummary.location.capacity.maxCapacity.toString() },
            ...(!residentialSummary.location.leafLevel
              ? [
                  {
                    type: 'inactive-cells',
                    text: apiData.parentLocation.inactiveCells.toString(),
                    ...(apiData.parentLocation.inactiveCells > 0
                      ? {
                          linkHref: `/inactive-cells/${prisonId}/${apiData.parentLocation.id}`,
                          linkLabel: 'View',
                        }
                      : {}),
                  },
                ]
              : []),
          )
        }

        res.locals.breadcrumbs.push(
          ...apiData.locationHierarchy.map(l => {
            return { title: l.localName || l.code, href: `/view-and-update-locations/${l.prisonId}/${l.id}` }
          }),
        )
      } else if (apiData.prisonSummary) {
        residentialSummary.summaryCards.push(
          { type: 'working-capacity', text: apiData.prisonSummary.workingCapacity.toString() },
          { type: 'signed-operational-capacity', text: apiData.prisonSummary.signedOperationalCapacity.toString() },
          { type: 'maximum-capacity', text: apiData.prisonSummary.maxCapacity.toString() },
        )
      }
      res.locals.residentialSummary = residentialSummary

      next()
    } catch (error) {
      logger.error(error, `Failed to populate residential summary for: ${user?.username}`)
      next(error)
    }
  }
}
