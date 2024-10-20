import { Request, Response } from 'express'
import controller from './viewLocationsShow'
import { addActions } from '../../routes/viewLocationsRouter'
import { Location } from '../../data/types/locationsApi'
import LocationFactory from '../../testutils/factories/location'
import { DecoratedLocation } from '../../decorators/decoratedLocation'

const buildDecoratedLocation = (params: Partial<Location>): DecoratedLocation => {
  const location = LocationFactory.build(params)

  return {
    ...location,
    raw: location,
    locationType: location.locationType.toLowerCase().replace(/^\w/, a => a.toUpperCase()),
  } as unknown as DecoratedLocation
}

describe('view locations show', () => {
  let req: Request
  let res: Response

  const convertToNonResAction = {
    text: 'Convert to non-residential room',
    href: '/location/7e570000-0000-0000-0000-000000000001/non-residential-conversion',
  }

  const deactivateCellAction = {
    text: 'Deactivate cell',
    href: '/location/7e570000-0000-0000-0000-000000000001/deactivate',
  }

  beforeEach(() => {
    const location = buildDecoratedLocation({ isResidential: true, leafLevel: true })
    req = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
    } as unknown as typeof req
    res = {
      locals: {
        residentialSummary: {
          location: { ...location, raw: location },
        },
      },
      render: jest.fn(),
    } as unknown as typeof res
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
          res.locals.residentialSummary.location = buildDecoratedLocation({ isResidential: false, leafLevel: true })

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when not leaf level', async () => {
          res.locals.residentialSummary.location = buildDecoratedLocation({ isResidential: true, leafLevel: false })

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when location is inactive', async () => {
          res.locals.residentialSummary.location = buildDecoratedLocation({
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
        res.locals.residentialSummary.location = buildDecoratedLocation({
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
          res.locals.residentialSummary.location.raw.locationType = 'OFFICE'

          await addActions(req, res, jest.fn())

          expect(res.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })
      })
    })
  })

  describe('actionButton', () => {
    beforeEach(() => {
      req.canAccess = jest.fn().mockImplementation(permission => permission === 'convert_non_residential')
      res.locals.residentialSummary.location = LocationFactory.build({
        active: true,
        isResidential: false,
        leafLevel: true,
      })
    })

    it('renders the page with the action button', () => {
      controller(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
        actionButton: {
          text: 'Convert to cell',
          href: `/location/7e570000-0000-0000-0000-000000000001/cell-conversion`,
          classes: 'govuk-!-float-right',
        },
        banner: {},
      })
    })

    describe('without the correct permissions', () => {
      beforeEach(() => {
        req.canAccess = jest.fn().mockReturnValue(false)
      })

      it('renders the page without the action button', () => {
        controller(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })

    describe('when inactive', () => {
      beforeEach(() => {
        res.locals.residentialSummary.location = LocationFactory.build({
          active: false,
          isResidential: false,
          leafLevel: true,
        })
      })

      it('renders the page without the action button', () => {
        controller(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })

    describe('when already residential', () => {
      beforeEach(() => {
        res.locals.residentialSummary.location = LocationFactory.build({
          active: true,
          isResidential: true,
          leafLevel: true,
        })
      })

      it('renders the page without the action button', () => {
        controller(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })

    describe('when not leaf level', () => {
      beforeEach(() => {
        res.locals.residentialSummary.location = LocationFactory.build({
          active: true,
          isResidential: false,
          leafLevel: false,
        })
      })

      it('renders the page without the action button', () => {
        controller(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })
  })
})
