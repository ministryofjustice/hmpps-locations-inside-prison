import nock, { RequestBodyMatcher } from 'nock'

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
    functionCall: () => (
      token: string,
      parameters: { [param: string]: string },
      data?: Record<string, unknown> | string[] | string,
    ) => unknown,
    parameters: { [param: string]: string } = {},
    method: 'get' | 'put' = 'get',
    data: Record<string, unknown> | string[] | string = undefined,
  ) {
    describe(functionName, () => {
      it('should return data from api', async () => {
        const response = { data: 'data' }

        fakeApiClient
          .intercept(url, method, data as RequestBodyMatcher)
          .matchHeader('authorization', `Bearer ${token.access_token}`)
          .reply(200, response)

        const output = await functionCall()(token.access_token, parameters, data)
        expect(output).toEqual(response)
      })

      if (cached) {
        it('should return data from the cache on the second call', async () => {
          const cachedResponse = { data: 'cachedData' }
          const response = { data: 'data' }

          fakeApiClient.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, cachedResponse)
          expect(await functionCall()(token.access_token, parameters, data)).toEqual(cachedResponse)
          expect(redisClient.cache).toEqual({ [url]: JSON.stringify(cachedResponse) })

          fakeApiClient
            .intercept(url, method, data as RequestBodyMatcher)
            .matchHeader('authorization', `Bearer ${token.access_token}`)
            .reply(200, response)

          expect(await functionCall()(token.access_token, parameters, data)).toEqual(cachedResponse)
        })
      } else {
        it('should not return data from the cache on the second call', async () => {
          const cachedResponse = { data: 'cachedData' }
          const response = { data: 'data' }

          fakeApiClient
            .intercept(url, method, data as RequestBodyMatcher)
            .matchHeader('authorization', `Bearer ${token.access_token}`)
            .reply(200, cachedResponse)
          expect(await functionCall()(token.access_token, parameters, data)).toEqual(cachedResponse)
          expect(redisClient.cache).toEqual({})

          fakeApiClient
            .intercept(url, method, data as RequestBodyMatcher)
            .matchHeader('authorization', `Bearer ${token.access_token}`)
            .reply(200, response)
          expect(await functionCall()(token.access_token, parameters, data)).toEqual(response)
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
    testCall(
      'getDeactivatedReasons',
      '/constants/deactivated-reason',
      true,
      () => apiClient.constants.getDeactivatedReasons,
    )
    testCall(
      'getSpecialistCellTypes',
      '/constants/specialist-cell-type',
      true,
      () => apiClient.constants.getSpecialistCellTypes,
    )
    testCall('getUsedForType', '/constants/used-for-type', true, () => apiClient.constants.getUsedForTypes)
    testCall(
      'getUsedForTypesForPrison',
      '/constants/used-for-type/TST',
      true,
      () => apiClient.constants.getUsedForTypesForPrison,
      { prisonId: 'TST' },
    )
  })

  describe('locations', () => {
    describe('deactivate', () => {
      testCall(
        'temporary',
        '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6/deactivate/temporary',
        false,
        () => apiClient.locations.deactivate.temporary,
        { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
        'put',
        {
          deactivationReason: 'reason',
          deactivationReasonDescription: 'description',
          proposedReactivationDate: '2024-01-01',
          planetFmReference: 'planet',
        },
      )
    })
    testCall(
      'updateNonResCell',
      '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6/update-non-res-cell',
      false,
      () => apiClient.locations.updateNonResCell,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
      'put',
      { convertedCellType: 'OTHER', otherConvertedCellType: 'some type' },
    )
    testCall(
      'convertCellToNonResCell',
      '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6/convert-cell-to-non-res-cell',
      false,
      () => apiClient.locations.convertCellToNonResCell,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
      'put',
      { convertedCellType: 'OTHER', otherConvertedCellType: 'some type' },
    )
    testCall(
      'convertToCell',
      '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6/convert-to-cell',
      false,
      () => apiClient.locations.convertToCell,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
      'put',
      {
        accommodationType: 'NORMAL_ACCOMMODATION',
        specialistCellTypes: ['ACCESSIBLE_CELL'],
        maxCapacity: 2,
        workingCapacity: 1,
        usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
      },
    )
    testCall(
      'getLocation',
      '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6',
      false,
      () => apiClient.locations.getLocation,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
    )
    testCall(
      'getResidentialSummary',
      '/locations/residential-summary/TST',
      false,
      () => apiClient.locations.getResidentialSummary,
      { prisonId: 'TST' },
    )
    testCall(
      'getResidentialSummary',
      '/locations/residential-summary/TST?parentLocationId=parent-id',
      false,
      () => apiClient.locations.getResidentialSummary,
      { prisonId: 'TST', parentLocationId: 'parent-id' },
    )
    testCall(
      'updateCapacity',
      '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6/capacity',
      false,
      () => apiClient.locations.updateCapacity,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
      'put',
      { maxCapacity: 2, workingCapacity: 1 },
    )
    testCall(
      'updateSpecialistCellTypes',
      '/locations/cc639c0e-02c4-4d34-a134-a15a40ae17b6/specialist-cell-types',
      false,
      () => apiClient.locations.updateSpecialistCellTypes,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
      'put',
      ['CAT_A'],
    )

    describe('prison', () => {
      testCall(
        'getArchivedLocations',
        '/locations/prison/TST/archived',
        false,
        () => apiClient.locations.prison.getArchivedLocations,
        { prisonId: 'TST' },
      )
      testCall(
        'getInactiveCells',
        '/locations/prison/TST/inactive-cells',
        false,
        () => apiClient.locations.prison.getInactiveCells,
        { prisonId: 'TST' },
      )
      testCall(
        'getInactiveCells',
        '/locations/prison/TST/inactive-cells?parentLocationId=parent-id',
        false,
        () => apiClient.locations.prison.getInactiveCells,
        { prisonId: 'TST', parentLocationId: 'parent-id' },
      )
    })
  })

  describe('prisonerLocations', () => {
    testCall(
      'getPrisonersInLocation',
      '/prisoner-locations/id/cc639c0e-02c4-4d34-a134-a15a40ae17b6',
      false,
      () => apiClient.prisonerLocations.getPrisonersInLocation,
      { locationId: 'cc639c0e-02c4-4d34-a134-a15a40ae17b6' },
    )
  })
})
