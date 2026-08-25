import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'

import addRootBreadcrumb from './addRootBreadcrumb'

jest.mock('./addBreadcrumb', () => {
  return jest.fn((breadcrumb: { title: string; href: string }) => {
    return jest.fn((req: any, res: any, next: any) => {
      res.locals.breadcrumbs = res.locals.breadcrumbs || []
      res.locals.breadcrumbs.push(breadcrumb)
      if (next) {
        next()
      }
    })
  })
})

describe('addRootBreadcrumb', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    deepReq = {
      canAccess: jest.fn().mockReturnValue(false),
    }

    deepRes = {
      locals: {
        user: {
          activeCaseload: {
            id: 'TST',
          },
          caseloads: [
            { id: 'TST', name: 'Test Prison' },
            { id: 'MDI', name: 'Moorland' },
          ],
        },
        prisonId: undefined,
      },
      redirect: jest.fn(),
    }

    next = jest.fn()
  })

  it('adds breadcrumb with default title when no prisonId', async () => {
    addRootBreadcrumb(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.breadcrumbs).toContainEqual({
      title: 'Locations',
      href: '/',
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('adds breadcrumb with caseload name when user has certificate_view_management permission', async () => {
    deepReq.canAccess = jest.fn().mockReturnValue(true)
    deepRes.locals.prisonId = 'TST'

    addRootBreadcrumb(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.breadcrumbs).toContainEqual({
      title: 'Locations - Test Prison',
      href: '/TST',
    })
    expect(deepReq.canAccess).toHaveBeenCalledWith('certificate_view_management')
    expect(next).toHaveBeenCalledWith()
  })

  it('adds breadcrumb with caseload name when user is not in active caseload', async () => {
    deepReq.canAccess = jest.fn().mockReturnValue(false)
    deepRes.locals.user.activeCaseload.id = 'TST'
    deepRes.locals.prisonId = 'MDI'

    addRootBreadcrumb(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.breadcrumbs).toContainEqual({
      title: 'Locations - Moorland',
      href: '/MDI',
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('adds breadcrumb without caseload name when caseload not found', async () => {
    deepReq.canAccess = jest.fn().mockReturnValue(true)
    deepRes.locals.prisonId = 'UNKNOWN'

    addRootBreadcrumb(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.breadcrumbs).toContainEqual({
      title: 'Locations',
      href: '/UNKNOWN',
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('does not add caseload name when user has certificate_view_management and is in active caseload', async () => {
    deepReq.canAccess = jest.fn().mockReturnValue(false)
    deepRes.locals.user.activeCaseload.id = 'TST'
    deepRes.locals.prisonId = 'TST'

    addRootBreadcrumb(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.breadcrumbs).toContainEqual({
      title: 'Locations',
      href: '/TST',
    })
    expect(next).toHaveBeenCalledWith()
  })
})
