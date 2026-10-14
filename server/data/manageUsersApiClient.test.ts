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
  async del(key: string) {
    delete redisClient.cache[key]
    return Promise.resolve(1)
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
    testCall(
      'getUsersByActiveCaseload',
      '/prisonusers/search?inclusiveRoles=true&status=ACTIVE&activeCaseload=CASELOAD&accessRoles=ROLE&size=50&page=1',
      false,
      () => apiClient.users.getUsersByActiveCaseload,
      { caseload: 'CASELOAD', accessRoles: 'ROLE', page: '1', size: '50' },
    )

    describe('get, when asked for the same user many times at once', () => {
      const user = { username: 'USERNAME', name: 'Lyle Lanley' }

      it('makes one call and gives every caller the result', async () => {
        fakeApiClient.get('/users/USERNAME').once().reply(200, user)

        const results = await Promise.all(
          Array.from({ length: 20 }, () => apiClient.users.get(token.access_token, { username: 'USERNAME' })),
        )

        expect(results).toEqual(Array(20).fill(user))
        expect(fakeApiClient.isDone()).toBe(true)
      })

      it('makes one call when redis is off', async () => {
        const clientWithoutRedis = new ManageUsersApiClient(null, null)
        fakeApiClient.get('/users/USERNAME').once().reply(200, user)

        const results = await Promise.all(
          Array.from({ length: 20 }, () => clientWithoutRedis.users.get(token.access_token, { username: 'USERNAME' })),
        )

        expect(results).toEqual(Array(20).fill(user))
        expect(fakeApiClient.isDone()).toBe(true)
      })

      it('makes a new call when the cache is cleared while the first is still running', async () => {
        fakeApiClient.get('/users/USERNAME').delay(50).reply(200, user)
        fakeApiClient.get('/users/USERNAME').reply(200, { ...user, name: 'Updated' })

        const first = apiClient.users.get(token.access_token, { username: 'USERNAME' })
        await apiClient.users.get.clearCache({ username: 'USERNAME' })
        const second = apiClient.users.get(token.access_token, { username: 'USERNAME' })

        expect(await second).toEqual({ ...user, name: 'Updated' })
        expect(await first).toEqual(user)
        expect(fakeApiClient.isDone()).toBe(true)
      })

      it('makes a new call once the first has finished and the cache is empty', async () => {
        fakeApiClient.get('/users/USERNAME').twice().reply(200, user)

        await apiClient.users.get(token.access_token, { username: 'USERNAME' })
        redisClient.cache = {}
        await apiClient.users.get(token.access_token, { username: 'USERNAME' })

        expect(fakeApiClient.isDone()).toBe(true)
      })
    })

    describe('get, when the user is not found', () => {
      beforeEach(() => {
        fakeApiClient.get('/users/UNKNOWN').once().reply(404, { status: 404 })
      })

      it('remembers that the user was not found, without calling again', async () => {
        await expect(apiClient.users.get(token.access_token, { username: 'UNKNOWN' })).rejects.toMatchObject({
          responseStatus: 404,
        })
        await expect(apiClient.users.get(token.access_token, { username: 'UNKNOWN' })).rejects.toMatchObject({
          responseStatus: 404,
        })

        expect(fakeApiClient.isDone()).toBe(true)
        expect(redisClient.cache).toEqual({ '/users/UNKNOWN': '{"cachedNotFound":true}' })
      })

      it('makes one call for many callers at once', async () => {
        const results = await Promise.allSettled(
          Array.from({ length: 20 }, () => apiClient.users.get(token.access_token, { username: 'UNKNOWN' })),
        )

        expect(results.every(r => r.status === 'rejected' && r.reason.responseStatus === 404)).toBe(true)
        expect(fakeApiClient.isDone()).toBe(true)
      })
    })
  })
})
