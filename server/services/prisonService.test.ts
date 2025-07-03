import PrisonService from './prisonService'
import PrisonApiClient from '../data/prisonApiClient'

jest.mock('../data/prisonApiClient')

describe('Prison service', () => {
  let apiClient: jest.Mocked<PrisonApiClient>
  let service: PrisonService

  beforeEach(() => {
    apiClient = new PrisonApiClient(null, null) as jest.Mocked<PrisonApiClient>
    apiClient.servicePrisons = {
      activatePrisonService: jest.fn() as jest.Mocked<any>,
      getServiceStatus: jest.fn() as jest.Mocked<any>,
    }

    service = new PrisonService(apiClient)
  })

  describe('getServiceStatus', () => {
    describe('when a prison and serviceCode are specified', () => {
      it('calls the correct client function', async () => {
        await service.getServiceStatus('token', 'MDI', 'DISPLAY_HOUSING_CHECKBOX')

        expect(apiClient.servicePrisons.getServiceStatus).toHaveBeenCalledWith('token', {
          prisonId: 'MDI',
          serviceCode: 'DISPLAY_HOUSING_CHECKBOX',
        })
      })
    })
  })

  describe('activatePrisonService', () => {
    describe('when a prison and serviceCode are specified', () => {
      it('when a prison and serviceCode are specified', async () => {
        await service.activatePrisonService('token', 'MDI', 'DISPLAY_HOUSING_CHECKBOX')

        expect(apiClient.servicePrisons.activatePrisonService).toHaveBeenCalledWith('token', {
          prisonId: 'MDI',
          serviceCode: 'DISPLAY_HOUSING_CHECKBOX',
        })
      })
    })
  })
})
