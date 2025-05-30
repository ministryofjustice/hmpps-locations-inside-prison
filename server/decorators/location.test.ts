import { DeepPartial } from 'fishery'
import LocationFactory from '../testutils/factories/location'
import decorateLocation from './location'
import ManageUsersService from '../services/manageUsersService'
import LocationsService from '../services/locationsService'

const deepManageUsersService: DeepPartial<ManageUsersService> = {
  getUser: (_token: string, username: string) => {
    return Promise.resolve({ name: `Resolved ${username}`, username })
  },
}
const manageUsersService = deepManageUsersService as ManageUsersService

const deepLocationsService: DeepPartial<LocationsService> = {
  getAccommodationType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
  getConvertedCellType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
  getDeactivatedReason: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
  getLocationType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
  getSpecialistCellType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
  getUsedForType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
}
const locationsService = deepLocationsService as LocationsService

describe('decorateLocation', () => {
  describe('when limited = false', () => {
    it('decorates all of the fields', async () => {
      const location = LocationFactory.build({
        accommodationTypes: ['TYPE1', 'TYPE2'],
        deactivatedBy: 'DEACTIVATE_USER',
        deactivatedReason: 'DEACTIVATED',
        lastModifiedBy: 'MODIFIED_USER',
        specialistCellTypes: ['TYPE1', 'TYPE2'],
        usedFor: ['TYPE1', 'TYPE2'],
      })
      const decoratedLocation = await decorateLocation({
        location,
        systemToken: 'token',
        userToken: 'token',
        manageUsersService,
        locationsService,
        limited: false,
      })

      expect(decoratedLocation.accommodationTypes).toEqual(location.accommodationTypes.map(s => `Resolved ${s}`))
      expect(decoratedLocation.convertedCellType).toEqual(`Resolved ${location.convertedCellType}`)
      expect(decoratedLocation.deactivatedBy).toEqual(`Resolved ${location.deactivatedBy}`)
      expect(decoratedLocation.deactivatedReason).toEqual(`Resolved ${location.deactivatedReason}`)
      expect(decoratedLocation.lastModifiedBy).toEqual(`Resolved ${location.lastModifiedBy}`)
      expect(decoratedLocation.locationType).toEqual(`Resolved ${location.locationType}`)
      expect(decoratedLocation.specialistCellTypes).toEqual(location.specialistCellTypes.map(s => `Resolved ${s}`))
      expect(decoratedLocation.usedFor).toEqual(location.usedFor.map(s => `Resolved ${s}`))
    })
  })

  describe('when limited = true', () => {
    it('only decorates the expected fields', async () => {
      const location = LocationFactory.build({
        accommodationTypes: ['TYPE1', 'TYPE2'],
        deactivatedBy: 'DEACTIVATE_USER',
        deactivatedReason: 'DEACTIVATED',
        lastModifiedBy: 'MODIFIED_USER',
        specialistCellTypes: ['TYPE1', 'TYPE2'],
        usedFor: ['TYPE1', 'TYPE2'],
      })
      const decoratedLocation = await decorateLocation({
        location,
        systemToken: 'token',
        userToken: 'token',
        manageUsersService,
        locationsService,
        limited: true,
      })

      expect(decoratedLocation.accommodationTypes).toEqual(location.accommodationTypes.map(s => `Resolved ${s}`))
      expect(decoratedLocation.convertedCellType).toEqual(`Resolved ${location.convertedCellType}`)
      expect(decoratedLocation.deactivatedBy).toEqual(location.deactivatedBy)
      expect(decoratedLocation.deactivatedReason).toEqual(location.deactivatedReason)
      expect(decoratedLocation.lastModifiedBy).toEqual(location.lastModifiedBy)
      expect(decoratedLocation.locationType).toEqual(`Resolved ${location.locationType}`)
      expect(decoratedLocation.specialistCellTypes).toEqual(location.specialistCellTypes.map(s => `Resolved ${s}`))
      expect(decoratedLocation.usedFor).toEqual(location.usedFor.map(s => `Resolved ${s}`))
    })
  })
})
