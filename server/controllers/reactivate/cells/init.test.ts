import ReactivateCellsInit from './init'

describe('ReactivateCellsInit', () => {
  const controller = new ReactivateCellsInit({ route: '/' })
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
        prisonId: 'TST',
        locationId: 'l0',
      },
    }
    res = {
      redirect: jest.fn(),
    }
  })

  describe('render', () => {
    describe('when multiple locations are selected', () => {
      beforeEach(() => {
        req.query.selectedLocations = ['l1', 'l2', 'l3']
      })

      it('sets values on the sessionModel', async () => {
        await controller.render(req, res, next)

        expect(req.sessionModel.set).toHaveBeenCalledWith('referrerLocationId', req.query.locationId)
        expect(req.sessionModel.set).toHaveBeenCalledWith('referrerPrisonId', req.query.prisonId)
        expect(req.sessionModel.set).toHaveBeenCalledWith('selectedLocations', req.query.selectedLocations)
      })
    })

    describe('when a single location is selected', () => {
      beforeEach(() => {
        req.query.selectedLocations = 'l1'
      })

      it('it redirects to single cell reactivation', async () => {
        await controller.render(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith(
          `/reactivate/cell/${req.query.selectedLocations}?ref=inactive-cells&refPrisonId=TST&refLocationId=l0`,
        )
      })
    })

    describe('when no locations are selected', () => {
      it('it redirects to the inactive-cells screen', async () => {
        await controller.render(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith(`/inactive-cells/${req.query.prisonId}/${req.query.locationId}`)
      })
    })
  })
})
