import { Request, Response } from 'express'
import controller from './viewLocationsShow'
import LocationFactory from '../../testutils/factories/location'

describe('view locations show', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    // @ts-ignore
    req = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
    }
    res = {
      // @ts-ignore
      locals: {
        residentialSummary: {
          location: LocationFactory.build(),
        },
      },
      render: jest.fn(),
    }
  })

  it('renders the page', () => {
    controller(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      actions: [],
      banner: {},
    })
  })

  it('renders the page with a banner', () => {
    const success = {
      title: 'Your attention please',
      content: 'Dinner is served',
    }
    // @ts-ignore
    req.flash = jest.fn(_param => [success])
    controller(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      actions: [],
      banner: {
        success,
      },
    })
  })

  describe('with the correct permissions', () => {
    beforeEach(() => {
      req.canAccess = jest.fn().mockReturnValue(true)
    })

    it('adds the convert to non-res action', () => {
      controller(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
        actions: [
          {
            text: 'Convert to non-residential room',
            href: '/location/7e570000-0000-0000-0000-000000000001/non-residential-conversion',
          },
        ],
        banner: {},
      })
    })

    it('adds no action for non-res cell', () => {
      res.locals.residentialSummary.location = LocationFactory.build({ isResidential: false })

      controller(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
        actions: [],
        banner: {},
      })
    })
  })
})
