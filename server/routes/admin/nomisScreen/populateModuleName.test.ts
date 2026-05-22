import { NextFunction, Request, Response } from 'express'
import populateModuleName from './populateModuleName'

describe('populateModuleName', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = { params: {} }
    res = { locals: {} as Response['locals'] }
    next = jest.fn()
  })

  it.each(['OIMILOCA', 'OIMULOCA'])('stashes %s on res.locals and calls next', moduleName => {
    req.params.moduleName = moduleName

    populateModuleName(req as Request, res as Response, next)

    expect(res.locals.moduleName).toBe(moduleName)
    expect(next).toHaveBeenCalledWith()
  })

  it('forwards a 404 error for an unknown module', () => {
    req.params.moduleName = 'OIMMHOLO'

    populateModuleName(req as Request, res as Response, next)

    expect(res.locals.moduleName).toBeUndefined()
    const error = (next as jest.Mock).mock.calls[0][0]
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(404)
  })

  it('forwards a 404 error when moduleName is missing', () => {
    populateModuleName(req as Request, res as Response, next)

    expect(res.locals.moduleName).toBeUndefined()
    const error = (next as jest.Mock).mock.calls[0][0]
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(404)
  })
})
