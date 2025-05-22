import { DeepPartial } from 'fishery'
import { Request, Response } from 'express'
import setCanAccess from './setCanAccess'

describe('setCanAccess', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let next: any

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      session: {},
    }
    deepRes = {
      locals: {
        user: {
          userRoles: [],
        },
      },
    }
  })

  beforeEach(() => {
    setCanAccess()(deepReq as Request, deepRes as Response, next)
  })

  it('adds a canAccess function to the request', () => {
    expect(deepReq.canAccess('random_permission')).toEqual(false)
  })

  it('calls next', () => {
    expect(next).toHaveBeenCalled()
  })
})
