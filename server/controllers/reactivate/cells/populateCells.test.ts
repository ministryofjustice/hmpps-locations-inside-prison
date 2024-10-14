import populateCells from './populateCells'

describe('populateCells', () => {
  let req: any
  let res: any
  let next: any

  const locationIds = ['l1', 'l2', 'l3']

  beforeEach(() => {
    next = jest.fn()
    req = {
      session: {},
      sessionModel: { get: jest.fn().mockReturnValue(locationIds) },
      services: {
        authService: {
          getSystemClientToken: jest.fn().mockResolvedValue('token'),
        },
        locationsService: {
          getLocation: jest.fn((token: string, id: string) => ({ id })),
        },
      },
    }
    res = {
      locals: {
        user: {
          username: 'username',
        },
      },
    }
  })

  it('sets the cells local', async () => {
    await populateCells(req, res, next)

    expect(res.locals.cells).toEqual(locationIds.map(id => ({ id })))
  })
})
