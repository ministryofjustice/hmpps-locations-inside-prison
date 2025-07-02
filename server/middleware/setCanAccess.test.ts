import { DeepPartial } from 'fishery'
import { Request, Response } from 'express'
import setCanAccess from './setCanAccess'
import LocationsService from '../services/locationsService'

describe('setCanAccess', () => {
  const locationsService = {
    getPrisonConfiguration: jest.fn(),
  } as unknown as jest.Mocked<LocationsService>

  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: jest.Mock

  beforeEach(() => {
    deepReq = {
      session: {},
      featureFlags: {},
    }

    deepRes = {
      locals: {
        user: {
          userRoles: ['MANAGE_RESIDENTIAL_LOCATIONS'],
          activeCaseload: { id: 'TST' },
        },
      },
    }

    next = jest.fn()

    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })
  })

  beforeEach(async () => {
    deepReq.featureFlags = { createAndCertify: true, map2380: false }
    await setCanAccess(locationsService)(deepReq as Request, deepRes as Response, next)
  })

  it('adds a canAccess function to the request', () => {
    expect(deepReq.canAccess('random_permission')).toEqual(false)
  })

  it('respects permissionOverrides based on prisonConfiguration and feature flags', async () => {
    expect(deepReq.canAccess?.('create_location')).toBe(true)
    expect(deepReq.canAccess?.('change_max_capacity')).toBe(true)
  })
})
