import nock from 'nock'

import { createClient } from 'redis'
import config from '../config'
import ManageUsersApiClient from './manageUsersApiClient'

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

describe('manageUsersApiClient', () => {
  let fakeApiClient: nock.Scope
  let apiClient: ManageUsersApiClient

  beforeEach(() => {
    fakeApiClient = nock(config.apis.manageUsersApi.url)
    apiClient = new ManageUsersApiClient(redisClient as unknown as ReturnType<typeof createClient>, null)

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
      } else {
        it('should not return data from the cache on the second call', async () => {
          const cachedResponse = { data: 'cachedData' }
          const response = { data: 'data' }

          fakeApiClient.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, cachedResponse)
          expect(await functionCall()(token.access_token, parameters)).toEqual(cachedResponse)
          expect(redisClient.cache).toEqual({})

          fakeApiClient.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, response)
          expect(await functionCall()(token.access_token, parameters)).toEqual(response)
        })
      }
    })
  }

  describe('users', () => {
    describe('me', () => {
      testCall('get', '/users/me', false, () => apiClient.users.me.get)
      testCall('getCaseloads', '/users/me/caseloads', false, () => apiClient.users.me.getCaseloads)
    })

    testCall('get', '/users/USERNAME', true, () => apiClient.users.get, { username: 'USERNAME' })
    testCall(
      'getUsersByCaseload',
      '/prisonusers/search?inclusiveRoles=true&status=ACTIVE&caseload=CASELOAD&accessRoles=ROLE&size=50&page=1',
      false,
      () => apiClient.users.getUsersByCaseload,
      { caseload: 'CASELOAD', accessRoles: 'ROLE', page: '1', size: '50' },
    )
  })
})
