import { Request, Response } from 'express'
import controller from './viewLocationsShow'
import LocationFactory from '../../testutils/factories/location'
import { addActions } from '../../routes/viewLocationsRouter'

describe('view locations show', () => {
  let req: Request
  let res: Response

  const convertToNonResAction = {
    text: 'Convert to non-residential room',
    href: '/location/7e570000-0000-0000-0000-000000000001/non-residential-conversion',
  }

  const deactivateCellAction = {
    text: 'Deactivate cell',
    href: '/location/7e570000-0000-0000-0000-000000000001/deactivate/temporary',
  }

  beforeEach(() => {
    // @ts-ignore
    req = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
    } as unknown as Request
    res = {
      locals: {
        residentialSummary: {
          location: LocationFactory.build({ isResidential: true, leafLevel: true }),
        },
      },
      render: jest.fn(),
    } as unknown as Response
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

  describe('addActions', () => {
    describe('convert to non-res', () => {
      describe('without the correct permissions', () => {
        beforeEach(() => {
          req.canAccess = jest.fn().mockReturnValue(false)
        })

        it('does not add the action', async () => {
          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })
      })

      describe('with the correct permissions', () => {
        beforeEach(() => {
          req.canAccess = jest.fn().mockReturnValue(true)
        })

        it('adds the action', async () => {
          await addActions(req, res, jest.fn())

          expect(res.locals.actions).toContainEqual(convertToNonResAction)
        })

        it('does not add the action for non-res cell', async () => {
          res.locals.residentialSummary.location = LocationFactory.build({ isResidential: false, leafLevel: true })

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when not leaf level', async () => {
          res.locals.residentialSummary.location = LocationFactory.build({ isResidential: true, leafLevel: false })

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when location is inactive', async () => {
          res.locals.residentialSummary.location = LocationFactory.build({
            active: false,
            isResidential: true,
            leafLevel: true,
          })

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })
      })
    })

    describe('deactivate cell', () => {
      beforeEach(() => {
        res.locals.residentialSummary.location = LocationFactory.build({
          active: true,
          locationType: 'CELL',
        })
      })

      describe('without the correct permissions', () => {
        beforeEach(() => {
          req.canAccess = jest.fn().mockReturnValue(false)
        })

        it('does not add the action', async () => {
          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })
      })

      describe('with the correct permissions', () => {
        beforeEach(() => {
          req.canAccess = jest.fn().mockReturnValue(true)
        })

        it('adds the action', async () => {
          await addActions(req, res, jest.fn())

          expect(res.locals.actions).toContainEqual(deactivateCellAction)
        })

        it('does not add the action when location is inactive', async () => {
          res.locals.residentialSummary.location.active = false

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })

        it('does not add the action when location is not a CELL', async () => {
          res.locals.residentialSummary.location.locationType = 'OFFICE'

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })
      })
    })
  })
})
