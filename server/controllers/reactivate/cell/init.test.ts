import ReactivateCellInit from './init'

describe('ReactivateCellInit', () => {
  const controller = new ReactivateCellInit({ route: '/' })
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    next = jest.fn()
    req = {
      form: { options: {} },
      session: {},
      sessionModel: { set: jest.fn() },
      query: {
        ref: 'refId',
        refPrisonId: 'TST',
        refLocationId: 'id',
      },
    }
    res = {
      redirect: jest.fn(),
    }
  })

  describe('render', () => {
    it('sets the referrer values in the sessionModel', async () => {
      await controller.render(req, res, next)

      expect(req.sessionModel.set).toHaveBeenCalledWith('referrerFlow', req.query.ref)
      expect(req.sessionModel.set).toHaveBeenCalledWith('referrerPrisonId', req.query.refPrisonId)
      expect(req.sessionModel.set).toHaveBeenCalledWith('referrerLocationId', req.query.refLocationId)
    })
  })
})
