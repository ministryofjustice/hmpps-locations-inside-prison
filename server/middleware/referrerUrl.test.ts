import { Request, RequestHandler, Response } from 'express'
import referrerUrl from './referrerUrl'

describe('Referrer URL', () => {
  const res: any = {}
  let req: Request
  let next: () => void
  let controller: RequestHandler

  beforeEach(() => {
    req = {
      headers: {},
      originalUrl: '/this/page',
      query: {},
      // @ts-ignore
      session: {},
    }
    next = jest.fn()

    controller = referrerUrl()
  })

  describe('POST request', () => {
    beforeEach(() => {
      req.method = 'POST'
    })

    it('should not set a referrerUrl in session by default', async () => {
      await controller(req, res, next)

      expect(req.session.referrerUrl).toEqual(undefined)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('GET request', () => {
    beforeEach(() => {
      req.method = 'GET'
      req.headers = {
        referer: 'https://localhost:3000/other/page',
      }
    })

    it('should set referrerUrl in session when referer header is set', async () => {
      await controller(req, res, next)

      expect(req.session.referrerUrl).toEqual('https://localhost:3000/other/page')
      expect(next).toHaveBeenCalled()
    })

    it('should clear referrerUrl in session when referer header is undefined', async () => {
      req.headers = {}

      await controller(req, res, next)

      expect(req.session.referrerUrl).toEqual(undefined)
      expect(next).toHaveBeenCalled()
    })

    it('should clear referrerUrl in session when referer header points to the current page', async () => {
      req.headers = {
        referer: 'https://localhost:3000/this/page',
      }

      await controller(req, res, next)

      expect(req.session.referrerUrl).toEqual(undefined)
      expect(next).toHaveBeenCalled()
    })
  })
})
