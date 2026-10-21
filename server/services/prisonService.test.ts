import PrisonService from './prisonService'
import { PrisonApiClient } from '../data/prisonApiClient'

jest.mock('../data/prisonApiClient')

describe('Prison service', () => {
  let apiClient: jest.Mocked<PrisonApiClient>
  let service: PrisonService

  beforeEach(() => {
    apiClient = new PrisonApiClient(null, null) as jest.Mocked<PrisonApiClient>
    apiClient.splashScreen = {
      getScreenStatus: jest.fn() as jest.Mocked<any>,
      addCondition: jest.fn() as jest.Mocked<any>,
      removeCondition: jest.fn() as jest.Mocked<any>,
      updateScreen: jest.fn() as jest.Mocked<any>,
    }

    service = new PrisonService(apiClient)
  })

  describe('getScreenStatus', () => {
    it('calls the correct client function', async () => {
      await service.getScreenStatus('token', 'MDI')

      expect(apiClient.splashScreen.getScreenStatus).toHaveBeenCalledWith('token', {
        prisonId: 'MDI',
        moduleName: 'OIMMHOLO',
      })
    })
  })

  describe('addCondition', () => {
    it('calls the correct client function', async () => {
      await service.addCondition('token', 'MDI', false)

      expect(apiClient.splashScreen.addCondition).toHaveBeenCalledWith(
        'token',
        { prisonId: 'MDI', moduleName: 'OIMMHOLO' },
        { conditionType: 'CASELOAD', conditionValue: 'MDI', blockAccess: false },
      )
    })
  })

  describe('removeCondition', () => {
    it('calls the correct client function', async () => {
      await service.removeCondition('token', 'MDI')

      expect(apiClient.splashScreen.removeCondition).toHaveBeenCalledWith('token', {
        prisonId: 'MDI',
        moduleName: 'OIMMHOLO',
      })
    })
  })

  describe('updateScreen', () => {
    it('calls the correct client function', async () => {
      await service.updateScreen('token', 'MDI', true)

      expect(apiClient.splashScreen.updateScreen).toHaveBeenCalledWith('token', {
        prisonId: 'MDI',
        moduleName: 'OIMMHOLO',
        blockScreen: 'true',
      })
    })
  })
})
