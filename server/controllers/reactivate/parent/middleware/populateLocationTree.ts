import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DecoratedLocation } from '../../../../decorators/decoratedLocation'
import { Location, LocationResidentialSummary } from '../../../../data/types/locationsApi'
import LocationsService from '../../../../services/locationsService'
import decorateLocation from '../../../../decorators/location'

export interface LocationTree {
  location: Location
  subLocations: LocationTree[]
}

export interface DecoratedLocationTree {
  decoratedLocation: DecoratedLocation
  decoratedSubLocations: DecoratedLocationTree[]
}

async function buildLocationTree({
  cells,
  id,
  locationsService,
  prisonId,
  systemToken,
}: {
  cells: Location[]
  id: string
  locationsService: LocationsService
  prisonId: string
  systemToken: string
}): Promise<LocationTree> {
  const residentialSummary = (await locationsService.getResidentialSummary(
    systemToken,
    prisonId,
    id,
  )) as LocationResidentialSummary
  const { parentLocation } = residentialSummary
  const subLocations = await Promise.all(
    residentialSummary.subLocations.map(l =>
      buildLocationTree({ cells, id: l.id, locationsService, prisonId, systemToken }),
    ),
  )

  if (residentialSummary.parentLocation.locationType === 'CELL' && !cells.includes(parentLocation)) {
    cells.push(parentLocation)
  }

  cells.push(
    ...subLocations
      .filter(l => l.location.locationType === 'CELL')
      .filter(l => !cells.includes(l.location))
      .map(l => l.location),
  )

  return {
    location: parentLocation,
    subLocations,
  }
}

async function buildDecoratedLocationTree({
  decoratedCells,
  id,
  locationsService,
  prisonId,
  systemToken,
}: {
  decoratedCells: DecoratedLocation[]
  id: string
  locationsService: LocationsService
  prisonId: string
  systemToken: string
}): Promise<DecoratedLocationTree> {
  const residentialSummary = (await locationsService.getResidentialSummary(
    systemToken,
    prisonId,
    id,
  )) as LocationResidentialSummary
  const parentLocation = await decorateLocation({
    location: residentialSummary.parentLocation,
    systemToken,
    userToken: '', // not required when limited: true
    manageUsersService: null, // not required when limited: true
    locationsService,
    limited: true,
  })
  const subLocations = await Promise.all(
    residentialSummary.subLocations.map(l =>
      buildDecoratedLocationTree({ decoratedCells, id: l.id, locationsService, prisonId, systemToken }),
    ),
  )

  if (residentialSummary.parentLocation.locationType === 'CELL' && !decoratedCells.includes(parentLocation)) {
    decoratedCells.push(parentLocation)
  }

  decoratedCells.push(
    ...subLocations
      .filter(l => l.decoratedLocation.locationType === 'CELL')
      .filter(l => !decoratedCells.includes(l.decoratedLocation))
      .map(l => l.decoratedLocation),
  )

  return {
    decoratedLocation: parentLocation,
    decoratedSubLocations: subLocations,
  }
}

export default function populateLocationTree(decorate: boolean) {
  return async (req: FormWizard.Request, res: Response, next: NextFunction) => {
    const { decoratedLocation, location, locationResidentialSummary } = res.locals
    const { systemToken } = req.session
    const { prisonId } = decoratedLocation || location
    const { locationsService } = req.services

    let selectedLocationIds = req.sessionModel.get<string[]>('selectLocations')
    if (!selectedLocationIds?.length) {
      selectedLocationIds = locationResidentialSummary.subLocations.map(l => l.id)
    }

    if (decorate) {
      res.locals.decoratedCells = []
      res.locals.decoratedLocationTree = await Promise.all(
        selectedLocationIds.map(async id =>
          buildDecoratedLocationTree({
            decoratedCells: res.locals.decoratedCells,
            id,
            locationsService,
            prisonId,
            systemToken,
          }),
        ),
      )
    } else {
      res.locals.cells = []
      res.locals.locationTree = await Promise.all(
        selectedLocationIds.map(async id =>
          buildLocationTree({
            cells: res.locals.cells,
            id,
            locationsService,
            prisonId,
            systemToken,
          }),
        ),
      )
    }

    next()
  }
}
