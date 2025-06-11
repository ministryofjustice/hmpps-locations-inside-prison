import { DeepPartial } from 'fishery'
import { Request, Response } from 'express'
import protectRoute from './protectRoute'

describe('protectRoute', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: any

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      session: {},
    }
  })

  describe('when user is missing required permission', () => {
    it('should call next with 403 error', () => {
      deepReq.canAccess = jest.fn(_param => false)
      protectRoute('required_permission')(deepReq as Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(new Error(`Forbidden. Missing permission: 'required_permission'`))
      expect(next.mock.lastCall[0].status).toEqual(403)
    })
  })

  describe('when user has required permission', () => {
    it('should call next without error', () => {
      deepReq.canAccess = jest.fn(_param => true)
      protectRoute('required_permission')(deepReq as Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith()
    })
  })
})
