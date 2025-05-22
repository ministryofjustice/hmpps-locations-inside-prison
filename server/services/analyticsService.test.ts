import { Request } from 'express'
import { DeepPartial } from 'fishery'
import GoogleAnalyticsClient from '../data/googleAnalyticsClient'
import AnalyticsService from './analyticsService'
import logger from '../../logger'

jest.mock('../data/googleAnalyticsClient')
jest.mock('../../logger', () => ({ warn: jest.fn() }))

describe('User service', () => {
  let googleAnalyticsClient: jest.Mocked<GoogleAnalyticsClient>
  let analyticsService: AnalyticsService

  describe('getUser', () => {
    const clientId = '123456.7654321'

    const deepReq: DeepPartial<Request> = {
      cookies: {
        _ga: `GA1.1.${clientId}`,
      },
    }

    const name = 'test'
    const params = { action: 'test' }
    const events = [
      {
        name: 'res_locations_test',
        params: {
          action: 'test',
        },
      },
    ]

    beforeEach(() => {
      googleAnalyticsClient = new GoogleAnalyticsClient() as jest.Mocked<GoogleAnalyticsClient>
      analyticsService = new AnalyticsService(googleAnalyticsClient)
    })

    it('retrieves and formats user name', async () => {
      googleAnalyticsClient.sendEvents.mockResolvedValue({ data: 'data' })
      const result = await analyticsService.sendEvent(deepReq as Request, name, params)

      expect(googleAnalyticsClient.sendEvents).toHaveBeenCalledWith(clientId, events)
      expect(result).toEqual({ data: 'data' })
    })

    it('does not reject or throw errors', async () => {
      googleAnalyticsClient.sendEvents.mockRejectedValue(new Error('some error'))

      await expect(analyticsService.sendEvent(deepReq as Request, name, params)).resolves.not.toThrow()
    })

    it('logs errors', async () => {
      const error = new Error('some error')
      googleAnalyticsClient.sendEvents.mockRejectedValue(error)

      await analyticsService.sendEvent(deepReq as Request, name, params)

      expect(logger.warn).toHaveBeenCalledWith(error, 'Failed to send Google Analytics event')
    })
  })
})
