import LocationsApiClient from '../data/locationsApiClient'
import LocationsService from './locationsService'

jest.mock('../data/locationsApiClient')

describe('Locations service', () => {
  let locationsApiClient: jest.Mocked<LocationsApiClient>
  let locationsService: LocationsService

  beforeEach(() => {
    locationsApiClient = new LocationsApiClient(null) as jest.Mocked<LocationsApiClient>
    locationsApiClient.constants = {
      getAccommodationTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getConvertedCellTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getDeactivatedReasons: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getLocationTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getNonResidentialUsageTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getResidentialAttributeTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getResidentialHousingTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getSpecialistCellTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
      getUsedForTypes: jest
        .fn()
        .mockResolvedValue({ accommodationTypes: [{ key: 'KEY', description: 'description' }] }),
    }
    locationsApiClient.locations = {
      getLocation: jest.fn(),
      getResidentialSummary: jest.fn(),
      prison: {
        getArchivedLocations: jest.fn(),
        getInactiveCells: jest.fn(),
      },
      updateCapacity: jest.fn(),
    }
    locationsService = new LocationsService(locationsApiClient)
  })

  function testConstantDataGetter(
    apiCallName: keyof LocationsApiClient['constants'],
    serviceCallName: keyof LocationsService,
  ) {
    describe(serviceCallName, () => {
      it('calls the correct client function', async () => {
        await locationsService[serviceCallName]('token', 'TYPE')

        expect(locationsApiClient.constants[apiCallName]).toHaveBeenCalledWith('token')
      })

      it('returns "Unknown" if the type does not exist', async () => {
        expect(await locationsService[serviceCallName]('token', 'TYPE')).toEqual('Unknown')
      })

      it('returns the description if the type does exist', async () => {
        expect(await locationsService[serviceCallName]('token', 'KEY')).toEqual('description')
      })

      it('only calls the api once per request', async () => {
        await locationsService[serviceCallName]('token', 'TYPE')
        await locationsService[serviceCallName]('token', 'TYPE')
        await locationsService[serviceCallName]('token', 'TYPE')

        expect(locationsApiClient.constants[apiCallName]).toHaveBeenCalledWith('token')
        expect(locationsApiClient.constants[apiCallName]).toHaveBeenCalledTimes(1)
      })
    })
  }

  testConstantDataGetter('getAccommodationTypes', 'getAccommodationType')
  testConstantDataGetter('getConvertedCellTypes', 'getConvertedCellType')
  testConstantDataGetter('getDeactivatedReasons', 'getDeactivatedReason')
  testConstantDataGetter('getLocationTypes', 'getLocationType')
  testConstantDataGetter('getNonResidentialUsageTypes', 'getNonResidentialUsageType')
  testConstantDataGetter('getResidentialAttributeTypes', 'getResidentialAttributeType')
  testConstantDataGetter('getResidentialHousingTypes', 'getResidentialHousingType')
  testConstantDataGetter('getSpecialistCellTypes', 'getSpecialistCellType')
  testConstantDataGetter('getUsedForTypes', 'getUsedForType')

  describe('getArchivedLocations', () => {
    it('calls the correct client function', async () => {
      await locationsService.getArchivedLocations('token', 'TST')

      expect(locationsApiClient.locations.prison.getArchivedLocations).toHaveBeenCalledWith('token', {
        prisonId: 'TST',
      })
    })
  })

  describe('getInactiveCells', () => {
    it('calls the correct client function', async () => {
      await locationsService.getInactiveCells('token', 'TST')

      expect(locationsApiClient.locations.prison.getInactiveCells).toHaveBeenCalledWith('token', { prisonId: 'TST' })
    })
  })

  describe('getResidentialSummary', () => {
    it('calls the correct client function', async () => {
      await locationsService.getResidentialSummary('token', 'TST')

      expect(locationsApiClient.locations.getResidentialSummary).toHaveBeenCalledWith('token', { prisonId: 'TST' })
    })
  })
})
