import nock from 'nock'

import { createClient } from 'redis'
import config from '../config'
import LocationsApiClient from './locationsApiClient'

jest.mock('./tokenStore/redisTokenStore')

const token = { access_token: 'token-1', expires_in: 300 }
const redisClient = {
  cache: {} as { [key: string]: string },
  async get(key: string) {
    return Promise.resolve(redisClient.cache[key])
  },
  async set(key: string, value: string) {
    redisClient.cache[key] = value
    return Promise.resolve(true)
  },
}

describe('locationsApiClient', () => {
  let fakeApiClient: nock.Scope
  let apiClient: LocationsApiClient

  beforeEach(() => {
    fakeApiClient = nock(config.apis.locationsApi.url)
    apiClient = new LocationsApiClient(redisClient as unknown as ReturnType<typeof createClient>)

    redisClient.cache = {}
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  function testCall(
    functionName: string,
    url: string,
    cached: boolean,
    functionCall: () => (token: string, parameters: { [param: string]: string }) => unknown,
    parameters: { [param: string]: string } = {},
  ) {
    describe(functionName, () => {
      it('should return data from api', async () => {
        const response = { data: 'data' }

        fakeApiClient.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, response)

        const output = await functionCall()(token.access_token, parameters)
        expect(output).toEqual(response)
      })

      if (cached) {
        it('should return data from the cache on the second call', async () => {
          const cachedResponse = { data: 'cachedData' }
          const response = { data: 'data' }

          fakeApiClient.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, cachedResponse)
          expect(await functionCall()(token.access_token, parameters)).toEqual(cachedResponse)
          expect(redisClient.cache).toEqual({ [url]: JSON.stringify(cachedResponse) })

          fakeApiClient.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, response)

          expect(await functionCall()(token.access_token, parameters)).toEqual(cachedResponse)
        })
      }
    })
  }

  describe('constants', () => {
    testCall(
      'getAccommodationType',
      '/constants/accommodation-type',
      true,
      () => apiClient.constants.getAccommodationTypes,
    )
    testCall('getUsedForType', '/constants/used-for-type', true, () => apiClient.constants.getUsedForTypes)
  })

  describe('locations', () => {
    testCall(
      'getResidentialSummary',
      '/locations/residential-summary/TST',
      false,
      () => apiClient.locations.getResidentialSummary,
      { prisonId: 'TST' },
    )
  })
})