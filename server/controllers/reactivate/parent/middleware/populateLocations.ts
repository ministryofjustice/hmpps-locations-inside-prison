import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DecoratedLocation } from '../../../../decorators/decoratedLocation'
import { Location } from '../../../../data/types/locationsApi'
import LocationsService from '../../../../services/locationsService'
import decorateLocation from '../../../../decorators/location'
import { LocationResidentialSummary } from '../../../../data/types/locationsApi/locationResidentialSummary'

export interface LocationMap {
  location: DecoratedLocation | Location
  subLocations: LocationMap[]
}

async function buildLocationForCellMap({
  cells,
  decorate,
  id,
  locationsService,
  prisonId,
  systemToken,
}: {
  cells: (DecoratedLocation | Location)[]
  decorate: boolean
  id: string
  locationsService: LocationsService
  prisonId: string
  systemToken: string
}): Promise<LocationMap> {
  const residentialSummary = (await locationsService.getResidentialSummary(
    systemToken,
    prisonId,
    id,
  )) as LocationResidentialSummary
  const parentLocation = decorate
    ? await decorateLocation({
        location: residentialSummary.parentLocation,
        systemToken,
        userToken: '', // not required when limited: true
        manageUsersService: null, // not required when limited: true
        locationsService,
        limited: true,
      })
    : residentialSummary.parentLocation
  const subLocations = await Promise.all(
    residentialSummary.subLocations.map(l =>
      buildLocationForCellMap({ cells, decorate, id: l.id, locationsService, prisonId, systemToken }),
    ),
  )

  if (residentialSummary.parentLocation.locationType === 'CELL' && !cells.includes(parentLocation)) {
    cells.push(parentLocation)
  }

  cells.push(
    ...subLocations
      .filter(l => ('raw' in l.location ? l.location.raw : l.location).locationType === 'CELL')
      .filter(l => !cells.includes(l.location))
      .map(l => l.location),
  )

  return {
    location: parentLocation,
    subLocations,
  }
}

export default function populateLocations(decorate: boolean) {
  return async (req: FormWizard.Request, res: Response, next: NextFunction) => {
    const {
      location,
      locationResidentialSummary,
      user,
    }: { location: Location; locationResidentialSummary: LocationResidentialSummary; user: Express.User } =
      res.locals as unknown as {
        location: Location
        locationResidentialSummary: LocationResidentialSummary
        user: Express.User
      }
    const { prisonId } = location
    const { locationsService } = req.services
    const systemToken = await req.services.authService.getSystemClientToken(user.username)

    let selectedLocationIds = req.sessionModel.get<string[]>('selectLocations')
    if (!selectedLocationIds?.length) {
      selectedLocationIds = locationResidentialSummary.subLocations.map(l => l.id)
    }

    res.locals.cells = []
    res.locals.locations = await Promise.all(
      selectedLocationIds.map(async id =>
        buildLocationForCellMap({ cells: res.locals.cells, decorate, id, locationsService, prisonId, systemToken }),
      ),
    )

    next()
  }
}
