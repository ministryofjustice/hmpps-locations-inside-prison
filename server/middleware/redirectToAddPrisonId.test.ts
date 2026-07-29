import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'

import redirectToAddPrisonId from './redirectToAddPrisonId'

describe('redirectToAddPrisonId', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: jest.Mock

  beforeEach(() => {
    deepReq = {
      params: {},
      originalUrl: '/view-and-update-locations',
    }

    deepRes = {
      locals: {
        prisonId: 'TST',
      },
      redirect: jest.fn(),
    }

    next = jest.fn()
  })

  it('redirects to append prison id when prisonId param is missing', async () => {
    await redirectToAddPrisonId(deepReq as Request, deepRes as Response, next)

    expect(deepRes.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST')
    expect(next).not.toHaveBeenCalled()
  })

  it('preserves the query string when redirecting', async () => {
    deepReq.originalUrl = '/view-and-update-locations?foo=bar&sort=desc'

    await redirectToAddPrisonId(deepReq as Request, deepRes as Response, next)

    expect(deepRes.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST?foo=bar&sort=desc')
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when prisonId param is present', async () => {
    deepReq.params.prisonId = 'TST'

    await redirectToAddPrisonId(deepReq as Request, deepRes as Response, next)

    expect(next).toHaveBeenCalledWith()
    expect(deepRes.redirect).not.toHaveBeenCalled()
  })
})
