import { Request, RequestHandler, Response } from 'express'
import { DeepPartial } from 'fishery'
import referrerUrl from './referrerUrl'

describe('Referrer URL', () => {
  let deepReq: DeepPartial<Request>
  const deepRes: DeepPartial<Response> = {}
  let next: () => void
  let controller: RequestHandler

  beforeEach(() => {
    deepReq = {
      headers: {},
      originalUrl: '/this/page',
      query: {},
      session: {},
    }
    next = jest.fn()

    controller = referrerUrl()
  })

  describe('POST request', () => {
    beforeEach(() => {
      deepReq.method = 'POST'
    })

    it('should not set a referrerUrl in session by default', async () => {
      await controller(deepReq as Request, deepRes as Response, next)

      expect(deepReq.session.referrerUrl).toBeUndefined()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('GET request', () => {
    beforeEach(() => {
      deepReq.method = 'GET'
      deepReq.headers = {
        referer: 'https://localhost:3000/other/page',
      }
    })

    it('should set referrerUrl in session when referer header is set', async () => {
      await controller(deepReq as Request, deepRes as Response, next)

      expect(deepReq.session.referrerUrl).toEqual('https://localhost:3000/other/page')
      expect(next).toHaveBeenCalled()
    })

    it('should clear referrerUrl in session when referer header is undefined', async () => {
      deepReq.headers = {}

      await controller(deepReq as Request, deepRes as Response, next)

      expect(deepReq.session.referrerUrl).toBeUndefined()
      expect(next).toHaveBeenCalled()
    })

    it('should clear referrerUrl in session when referer header points to the current page', async () => {
      deepReq.headers = {
        referer: 'https://localhost:3000/this/page',
      }

      await controller(deepReq as Request, deepRes as Response, next)

      expect(deepReq.session.referrerUrl).toBeUndefined()
      expect(next).toHaveBeenCalled()
    })
  })
})
