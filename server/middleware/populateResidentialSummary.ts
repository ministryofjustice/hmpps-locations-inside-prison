import { RequestHandler } from 'express'
import logger from '../../logger'
import { Services } from '../services'
import { Location } from '../data/locationsApiClient'
import formatDaysAgo from '../formatters/formatDaysAgo'
import decorateLocation from '../decorators/location'

const ignoredAccommodationTypes = ['Care and separation', 'Healthcare inpatients', 'Other', 'Unknown']

type LocationDetails = { key: { text?: string; html?: string }; value: { text?: string; html?: string } }[]

function getLocationDetails(location: Location) {
  const details: LocationDetails = [{ key: { text: 'Location' }, value: { text: location.pathHierarchy } }]

  if (!location.leafLevel) {
    details.push({ key: { text: 'Local name' }, value: { text: location.localName } })
  }

  if (location.status === 'NON_RESIDENTIAL') {
    details.push({ key: { text: 'Non-residential room' }, value: { text: location.convertedCellType } })
  } else if (location.locationType === 'Cell') {
    details.push({
      key: { text: 'Cell type' },
      value: { html: location.specialistCellTypes.join('<br>') },
    })
  } else {
    if (location.accommodationTypes.filter(type => !ignoredAccommodationTypes.includes(type)).length) {
      details.push({
        key: { text: 'Accommodation type' },
        value: { html: location.accommodationTypes.join('<br>') },
      })
    }

    if (location.accommodationTypes.includes('Normal accommodation') && location.usedFor.length) {
      details.push({ key: { text: 'Used for' }, value: { html: location.usedFor.join('<br>') } })
    }
  }

  if (!location.leafLevel) {
    details.push({
      key: { text: 'Last updated' },
      value: {
        text: `${formatDaysAgo(location.lastModifiedDate)} by ${location.lastModifiedBy}`,
      },
    })
  }

  return details
}

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
        locationDetails?: LocationDetails
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

        residentialSummary.locationDetails = getLocationDetails(residentialSummary.location)
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
