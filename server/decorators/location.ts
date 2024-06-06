import { Location } from '../data/locationsApiClient'
import LocationsService from '../services/locationsService'
import ManageUsersService from '../services/manageUsersService'

export default async function decorateLocation({
  location,
  systemToken,
  userToken,
  manageUsersService,
  locationsService,
}: {
  location: Location
  systemToken: string
  userToken: string
  manageUsersService: ManageUsersService
  locationsService: LocationsService
}) {
  return {
    ...location,
    accommodationTypes: await Promise.all(
      location.accommodationTypes.map(a => locationsService.getAccommodationType(systemToken, a)),
    ),
    deactivatedBy: location.deactivatedBy
      ? (await manageUsersService.getUser(userToken, location.deactivatedBy)).name
      : undefined,
    deactivatedReason: location.deactivatedReason
      ? await locationsService.getDeactivatedReason(systemToken, location.deactivatedReason)
      : undefined,
    lastModifiedBy: location.lastModifiedBy
      ? (await manageUsersService.getUser(userToken, location.lastModifiedBy)).name
      : undefined,
    specialistCellTypes: await Promise.all(
      location.specialistCellTypes.map(a => locationsService.getSpecialistCellType(systemToken, a)),
    ),
    usedFor: await Promise.all(location.usedFor.map(a => locationsService.getUsedForType(systemToken, a))),
  }
}
