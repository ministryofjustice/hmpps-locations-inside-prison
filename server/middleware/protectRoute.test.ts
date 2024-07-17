import protectRoute from './protectRoute'

describe('protectRoute', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    next = jest.fn()
    req = {
      session: {},
    }
  })

  describe('when user is missing required permission', () => {
    it('should call next with 403 error', () => {
      req.canAccess = jest.fn(_param => false)
      protectRoute('required_permission')(req, res, next)

      expect(next).toHaveBeenCalledWith(new Error(`Forbidden. Missing permission: 'required_permission'`))
      expect(next.mock.lastCall[0].status).toEqual(403)
    })
  })

  describe('when user has required permission', () => {
    it('should call next without error', () => {
      req.canAccess = jest.fn(_param => true)
      protectRoute('required_permission')(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })
  })
})
