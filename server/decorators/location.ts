import { Location } from '../data/locationsApiClient'
import LocationsService from '../services/locationsService'
import ManageUsersService from '../services/manageUsersService'
import logger from '../../logger'

export default async function decorateLocation({
  location,
  systemToken,
  userToken,
  manageUsersService,
  locationsService,
  limited = false,
}: {
  location: Location
  systemToken: string
  userToken: string
  manageUsersService: ManageUsersService
  locationsService: LocationsService
  limited?: boolean
}) {
  logger.debug(`decorate location: ${JSON.stringify(location)}`)

  return {
    ...location,
    accommodationTypes: await Promise.all(
      location.accommodationTypes.map(a => locationsService.getAccommodationType(systemToken, a)),
    ),
    convertedCellType: location.convertedCellType
      ? await locationsService.getConvertedCellType(systemToken, location.convertedCellType)
      : location.convertedCellType,
    deactivatedBy:
      location.deactivatedBy && !limited
        ? (await manageUsersService.getUser(userToken, location.deactivatedBy))?.name || location.deactivatedBy
        : location.deactivatedBy,
    deactivatedReason:
      location.deactivatedReason && !limited
        ? await locationsService.getDeactivatedReason(systemToken, location.deactivatedReason)
        : location.deactivatedReason,
    lastModifiedBy:
      location.lastModifiedBy && !limited
        ? (await manageUsersService.getUser(userToken, location.lastModifiedBy))?.name || location.lastModifiedBy
        : location.lastModifiedBy,
    locationType: await locationsService.getLocationType(systemToken, location.locationType),
    specialistCellTypes: await Promise.all(
      location.specialistCellTypes.map(a => locationsService.getSpecialistCellType(systemToken, a)),
    ),
    usedFor: await Promise.all(location.usedFor.map(a => locationsService.getUsedForType(systemToken, a))),
  }
}
