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
          userRoles: ['MANAGE_RES_LOCATIONS_OP_CAP'],
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
    deepReq.featureFlags = { createAndCertify: true }
    deepReq.params = { prisonId: 'TST' }
    await setCanAccess(locationsService)(deepReq as Request, deepRes as Response, next)
  })

  it('adds a canAccess function to the request', () => {
    expect(deepReq.canAccess('random_permission')).toEqual(false)
  })

  it('respects permissionOverrides based on prisonConfiguration and feature flags', async () => {
    expect(deepReq.canAccess?.('create_location')).toBe(true)
    expect(deepReq.canAccess?.('change_max_capacity')).toBe(true)
  })

  it('respects permissionOverrides when prisonId (with INACTIVE certification) in params is different from activeCaseload', async () => {
    deepReq.params = { prisonId: 'LSI' }

    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'LSI',
      resiLocationServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })
    await setCanAccess(locationsService)(deepReq as Request, deepRes as Response, next)
    expect(deepReq.canAccess?.('create_location')).toBe(false)
  })

  it('respects permissionOverrides when prisonId (with ACTIVE certification) in params is different from activeCaseload', async () => {
    deepReq.params = { prisonId: 'WWI' }

    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'WWI',
      resiLocationServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })
    await setCanAccess(locationsService)(deepReq as Request, deepRes as Response, next)
    expect(deepReq.canAccess?.('create_location')).toBe(true)
  })
})
