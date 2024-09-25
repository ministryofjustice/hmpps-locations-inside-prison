import GoogleAnalyticsClient from '../data/googleAnalyticsClient'
import AnalyticsService from './analyticsService'

jest.mock('../data/googleAnalyticsClient')

describe('User service', () => {
  let googleAnalyticsClient: jest.Mocked<GoogleAnalyticsClient>
  let analyticsService: AnalyticsService

  describe('getUser', () => {
    const clientId = '123456.7654321'
    const events = [
      {
        name: 'test',
        params: [
          {
            action: 'test',
          },
        ],
      },
    ]

    beforeEach(() => {
      googleAnalyticsClient = new GoogleAnalyticsClient() as jest.Mocked<GoogleAnalyticsClient>
      analyticsService = new AnalyticsService(googleAnalyticsClient)
    })

    it('retrieves and formats user name', async () => {
      googleAnalyticsClient.sendEvents.mockResolvedValue({ data: 'data' })
      const result = await analyticsService.sendEvents(clientId, events)

      expect(googleAnalyticsClient.sendEvents).toHaveBeenCalledWith(clientId, events)
      expect(result).toEqual({ data: 'data' })
    })

    it('propagates error', async () => {
      googleAnalyticsClient.sendEvents.mockRejectedValue(new Error('some error'))

      await expect(analyticsService.sendEvents(clientId, events)).rejects.toEqual(new Error('some error'))
    })
  })
})
