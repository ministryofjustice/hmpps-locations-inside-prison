import { Request, RequestHandler } from 'express'
import logger from '../../logger'
import { Services } from '../services'
import formatDaysAgo from '../formatters/formatDaysAgo'
import decorateLocation from '../decorators/location'
import { SummaryListRow } from '../@types/govuk'
import { DecoratedLocation } from '../decorators/decoratedLocation'

function showChangeCapacityLink(location: DecoratedLocation, req: Request) {
  const { active, capacity, leafLevel } = location
  return active && capacity && leafLevel && req.canAccess('change_cell_capacity')
}

function showEditCellTypeLinks(location: DecoratedLocation, req: Request) {
  return location.active && req.canAccess('set_cell_type')
}

function showChangeUsedForLink(location: DecoratedLocation, req: Request) {
  return location.active && req.canAccess('change_used_for')
}

function cellTypesRow(location: DecoratedLocation, req: Request): SummaryListRow {
  const { specialistCellTypes } = location
  const setCellTypeUrl = `/location/${location.id}/set-cell-type`
  const removeCellTypeUrl = `/location/${location.id}/remove-cell-type`
  const row: any = { key: { text: 'Cell type' } }
  if (specialistCellTypes.length) {
    row.value = {
      html: specialistCellTypes.join('<br>'),
    }

    if (showEditCellTypeLinks(location, req)) {
      row.actions = {
        items: [
          {
            href: removeCellTypeUrl,
            text: 'Remove',
          },
          {
            href: setCellTypeUrl,
            text: 'Change',
          },
        ],
      }
    }
  } else if (showEditCellTypeLinks(location, req)) {
    row.value = {
      html: `<a href="${setCellTypeUrl}" class="govuk-link">Set specific cell type</a>`,
    }
  }
  return row
}

function usedForRow(location: DecoratedLocation, req: Request): SummaryListRow {
  const { usedFor } = location
  const changeUsedForUrl = `/location/${location.id}/change-used-for`
  const row: any = { key: { text: 'Used for' } }
  if (usedFor.length) {
    row.value = {
      html: location.usedFor.join('<br>'),
    }

    if (showChangeUsedForLink(location, req)) {
      row.actions = {
        items: [
          {
            href: changeUsedForUrl,
            text: 'Change',
          },
        ],
      }
    }
  } else {
    row.value = {
      html: location.usedFor.join('<br>'),
    }
  }
  return row
}

function nonResCellTypeRow(location: DecoratedLocation) {
  const { convertedCellType, otherConvertedCellType } = location
  const text = otherConvertedCellType?.length ? `${convertedCellType} - ${otherConvertedCellType}` : convertedCellType

  return { key: { text: 'Non-residential room' }, value: { text } }
}

function getLocationDetails(location: DecoratedLocation, req: Request) {
  const details: SummaryListRow[] = [{ key: { text: 'Location' }, value: { text: location.pathHierarchy } }]

  if (!location.leafLevel) {
    details.push({ key: { text: 'Local name' }, value: { text: location.localName } })
  }

  if (location.status === 'NON_RESIDENTIAL') {
    details.push(nonResCellTypeRow(location))
  } else {
    if (location.locationType === 'Cell') {
      details.push(cellTypesRow(location, req))
    }

    details.push({
      key: { text: 'Accommodation type' },
      value: { html: location.accommodationTypes.join('<br>') },
    })

    details.push(usedForRow(location, req))
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
        location?: DecoratedLocation
        locationDetails?: SummaryListRow[]
        locationHistory?: boolean // TODO: change this type when location history tab is implemented
        subLocationName: string
        subLocations: DecoratedLocation[]
        summaryCards: { type: string; text: string; linkHref?: string; linkLabel?: string; linkAriaLabel?: string }[]
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

      res.locals.topLevelLocationType = apiData.topLevelLocationType
      res.locals.locationHierarchy = apiData.locationHierarchy

      if (apiData.parentLocation) {
        residentialSummary.location = await decorateLocation({
          location: apiData.parentLocation,
          locationsService,
          manageUsersService,
          systemToken: token,
          userToken: res.locals.user.token,
        })

        residentialSummary.locationDetails = getLocationDetails(residentialSummary.location, req)
        residentialSummary.locationHistory = true

        if (residentialSummary.location.status !== 'NON_RESIDENTIAL') {
          const changeLink: { linkHref?: string; linkLabel?: string } = {}
          const workingCapLink: { linkAriaLabel?: string } = {}
          const maxCapLink: { linkAriaLabel?: string } = {}

          if (showChangeCapacityLink(residentialSummary.location, req)) {
            changeLink.linkHref = `/location/${req.params.locationId}/change-cell-capacity`
            changeLink.linkLabel = 'Change'
            workingCapLink.linkAriaLabel = 'Change working capacity'
            maxCapLink.linkAriaLabel = 'Change maximum capacity'
          }
          residentialSummary.summaryCards.push(
            {
              type: 'working-capacity',
              text: residentialSummary.location.capacity.workingCapacity.toString(),
              ...changeLink,
              ...workingCapLink,
            },
            {
              type: 'maximum-capacity',
              text: residentialSummary.location.capacity.maxCapacity.toString(),
              ...changeLink,
              ...maxCapLink,
            },
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
      } else if (apiData.prisonSummary) {
        const changeLink: { linkHref?: string; linkLabel?: string; linkAriaLabel?: string } = {}
        if (req.canAccess('change_signed_operational_capacity')) {
          changeLink.linkHref = `/change-signed-operational-capacity/${prisonId}`
          changeLink.linkLabel = 'Change'
          changeLink.linkAriaLabel = 'Change signed operational capacity'
        }
        residentialSummary.summaryCards.push(
          { type: 'working-capacity', text: apiData.prisonSummary.workingCapacity.toString() },
          {
            type: 'signed-operational-capacity',
            text: apiData.prisonSummary.signedOperationalCapacity.toString(),
            ...changeLink,
          },
          { type: 'maximum-capacity', text: apiData.prisonSummary.maxCapacity.toString() },
        )
      }
      res.locals.residentialSummary = residentialSummary

      next()
    } catch (error) {
      logger.error(
        error,
        `Failed to populate residential summary for: prisonId: ${prisonId}, locationId: ${req.params.locationId}`,
      )
      next(error)
    }
  }
}
