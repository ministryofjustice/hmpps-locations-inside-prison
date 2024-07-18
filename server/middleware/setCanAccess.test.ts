import setCanAccess from './setCanAccess'

describe('setCanAccess', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    next = jest.fn()
    req = {
      session: {},
    }
    res = {
      locals: {
        user: {
          userRoles: [],
        },
      },
    }
  })

  beforeEach(() => {
    setCanAccess()(req, res, next)
  })

  it('adds a canAccess function to the request', () => {
    expect(req.canAccess('random_permission')).toEqual(false)
  })

  it('calls next', () => {
    expect(next).toHaveBeenCalled()
  })
})
