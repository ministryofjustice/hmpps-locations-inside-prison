import nock from 'nock'
import config from '../config'
import GoogleAnalyticsClient from './googleAnalyticsClient'

const mockGoogleAnalyticsConfig = {
  measurementId: 'G-A1AA1A1AAA',
  measurementApi: {
    secret: 'Aa-111AaAAaaAA1aAAA_Aa',
    url: 'https://www.google-analytics.com',
  },
}

jest.mock('../config', () => ({
  get googleAnalytics() {
    return mockGoogleAnalyticsConfig
  },
}))

describe('googleAnalyticsClient', () => {
  let fakeGoogleAnalyticsClient: nock.Scope
  let googleAnalyticsClient: GoogleAnalyticsClient

  beforeEach(() => {
    mockGoogleAnalyticsConfig.measurementId = 'G-A1AA1A1AAA'
    fakeGoogleAnalyticsClient = nock(config.googleAnalytics.measurementApi.url)
    googleAnalyticsClient = new GoogleAnalyticsClient()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('sendEvents', () => {
    it('should query the API for alerts', async () => {
      const response = { data: 'data' }
      const clientId = '123456.7654321'
      const events = [
        {
          name: 'Cell move proposed',
          params: {
            param1: 'value1',
          },
        },
        {
          name: 'Cell move cancelled',
          params: {
            param1: 'value2',
          },
        },
      ]
      const payload = {
        client_id: clientId,
        non_personalized_ads: true,
        events,
      }

      fakeGoogleAnalyticsClient
        .post('/mp/collect?measurement_id=G-A1AA1A1AAA&api_secret=Aa-111AaAAaaAA1aAAA_Aa', payload)
        .reply(200, response)

      const output = await googleAnalyticsClient.sendEvents(clientId, events)
      expect(output).toEqual(response)
    })

    it('does not call the API when analytics is not configured', async () => {
      mockGoogleAnalyticsConfig.measurementId = ''

      await expect(googleAnalyticsClient.sendEvents('123456.7654321', [])).rejects.toThrow('ECONNREFUSED')
    })
  })
})
