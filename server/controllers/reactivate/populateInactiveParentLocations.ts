import { uniq } from 'lodash'
import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import LocationsService from '../../services/locationsService'
import { DecoratedLocation } from '../../decorators/decoratedLocation'
import { Location } from '../../data/types/locationsApi'
import decorateLocation from '../../decorators/location'

async function addInactiveParentLocations(
  locationsService: LocationsService,
  token: string,
  inactiveParentLocations: DecoratedLocation[],
  childLocations: (DecoratedLocation | Location)[],
) {
  const uniqueParentIds = uniq(childLocations.map(location => location.parentId))
    .filter(id => id)
    .filter(id => !inactiveParentLocations.find(l => l.id === id))
  if (!uniqueParentIds.length) {
    return
  }

  const locations: DecoratedLocation[] = []

  await Promise.all(
    uniqueParentIds.map(async id => {
      const location = await locationsService.getLocation(token, id)
      if (location.status === 'INACTIVE') {
        locations.push(
          await decorateLocation({
            location,
            systemToken: token,
            userToken: '', // not required when limited: true
            manageUsersService: null, // not required when limited: true
            locationsService,
            limited: true,
          }),
        )
      }
    }),
  )

  if (locations.length) {
    inactiveParentLocations.push(...locations)
    await addInactiveParentLocations(locationsService, token, inactiveParentLocations, locations)
  }
}

export default async function populateInactiveParentLocations(
  req: FormWizard.Request,
  res: Response,
  next: NextFunction,
) {
  const { cells, location, user }: { cells?: Location[]; location?: DecoratedLocation; user: Express.User } = res.locals
  const { authService, locationsService } = req.services
  const childLocations = cells || [location].filter(l => l)

  if (childLocations.length) {
    res.locals.inactiveParentLocations = []
    const token = await authService.getSystemClientToken(user.username)
    await addInactiveParentLocations(locationsService, token, res.locals.inactiveParentLocations, cells || [location])
  }

  next()
}
