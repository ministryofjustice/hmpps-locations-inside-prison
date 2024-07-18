import { Request, Response } from 'express'
import controller from './viewLocationsShow'

describe('view locations show', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    // @ts-ignore
    req = {
      flash: jest.fn(),
    }
    // @ts-ignore
    res = {
      render: jest.fn(),
    }
  })

  it('renders the page', () => {
    controller(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
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
      banner: {
        success,
      },
    })
  })
})
