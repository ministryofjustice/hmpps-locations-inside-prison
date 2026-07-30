import { DeepPartial } from 'fishery'
import { Request, Response } from 'express'
import setCanAccess from './setCanAccess'

describe('setCanAccess', () => {
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
        prisonConfiguration: {
          prisonId: 'TST',
          resiLocationServiceActive: 'INACTIVE',
          nonResiServiceActive: 'INACTIVE',
          includeSegregationInRollCount: 'INACTIVE',
          certificationApprovalRequired: 'ACTIVE',
        },
      },
    }

    next = jest.fn()
  })

  beforeEach(async () => {
    deepReq.params = { prisonId: 'TST' }
    setCanAccess(deepReq as Request, deepRes as Response, next)
  })

  it('adds a canAccess function to the request', () => {
    expect(deepReq.canAccess('random_permission')).toEqual(false)
  })

  it('respects permissionOverrides based on prisonConfiguration and feature flags', async () => {
    expect(deepReq.canAccess?.('create_location')).toBe(true)
  })

  it('respects permissionOverrides when prisonId (with INACTIVE certification) in params is different from activeCaseload', async () => {
    deepReq.params = { prisonId: 'LSI' }
    deepRes.locals.prisonConfiguration = {
      prisonId: 'LSI',
      resiLocationServiceActive: 'INACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    }

    setCanAccess(deepReq as Request, deepRes as Response, next)
    expect(deepReq.canAccess?.('create_location')).toBe(false)
  })

  it('respects permissionOverrides when prisonId (with ACTIVE certification) in params is different from activeCaseload', async () => {
    deepReq.params = { prisonId: 'WWI' }
    deepRes.locals.prisonConfiguration = {
      prisonId: 'WWI',
      resiLocationServiceActive: 'INACTIVE',
      nonResiServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    }

    setCanAccess(deepReq as Request, deepRes as Response, next)
    expect(deepReq.canAccess?.('create_location')).toBe(true)
  })
})
