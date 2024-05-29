import { LocationsApiClient } from '../data'
import LocationsService from './locationsService'

jest.mock('../data/locationsApiClient')

describe('Locations service', () => {
  let locationsApiClient: jest.Mocked<LocationsApiClient>
  let locationsService: LocationsService

  beforeEach(() => {
    locationsApiClient = new LocationsApiClient(null) as jest.Mocked<LocationsApiClient>
    locationsApiClient.constants = {
      getAccommodationTypes: jest.fn(),
      getUsedForTypes: jest.fn(),
    }
    locationsApiClient.locations = {
      getResidentialSummary: jest.fn(),
    }
    locationsService = new LocationsService(locationsApiClient)
  })

  describe('getAccommodationTypes', () => {
    it('calls the correct client function', async () => {
      await locationsService.getAccommodationTypes('token')

      expect(locationsApiClient.constants.getAccommodationTypes).toHaveBeenCalledWith('token')
    })
  })

  describe('getUsedForTypes', () => {
    it('calls the correct client function', async () => {
      await locationsService.getUsedForTypes('token')

      expect(locationsApiClient.constants.getUsedForTypes).toHaveBeenCalledWith('token')
    })
  })

  describe('getResidentialSummary', () => {
    it('calls the correct client function', async () => {
      await locationsService.getResidentialSummary('token', 'TST')

      expect(locationsApiClient.locations.getResidentialSummary).toHaveBeenCalledWith('token', { prisonId: 'TST' })
    })
  })
})
