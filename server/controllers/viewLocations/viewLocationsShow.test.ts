import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import controller from './viewLocationsShow'
import { addActions } from '../../routes/viewLocationsRouter'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('view locations show', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const convertToNonResAction = {
    text: 'Convert to non-residential room',
    href: '/location/7e570000-0000-0000-0000-000000000001/non-residential-conversion',
  }

  const deactivateCellAction = {
    text: 'Deactivate cell',
    href: '/location/7e570000-0000-0000-0000-000000000001/deactivate',
  }

  beforeEach(() => {
    deepReq = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
    }
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          location: buildDecoratedLocation({ isResidential: true, leafLevel: true }),
        },
      },
      render: jest.fn(),
    }
  })

  it('renders the page', () => {
    controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      banner: {},
    })
  })

  it('renders the page with a banner', () => {
    const success = {
      title: 'Your attention please',
      content: 'Dinner is served',
    }
    // @ts-expect-error: lint thinks that the jest.fn has 0 args
    deepReq.flash = jest.fn(_param => [success])
    controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      banner: {
        success,
      },
    })
  })

  describe('addActions', () => {
    describe('convert to non-res', () => {
      describe('without the correct permissions', () => {
        beforeEach(() => {
          deepReq.canAccess = jest.fn().mockReturnValue(false)
        })

        it('does not add the action', async () => {
          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })
      })

      describe('with the correct permissions', () => {
        beforeEach(() => {
          deepReq.canAccess = jest.fn().mockReturnValue(true)
        })

        it('adds the action', async () => {
          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions).toContainEqual(convertToNonResAction)
        })

        it('does not add the action for non-res cell', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            isResidential: false,
            leafLevel: true,
          })

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when not leaf level', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            isResidential: true,
            leafLevel: false,
          })

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when location is inactive', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            active: false,
            isResidential: true,
            leafLevel: true,
          })

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })
      })
    })

    describe('deactivate cell', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
          active: true,
          locationType: 'CELL',
        })
      })

      describe('without the correct permissions', () => {
        beforeEach(() => {
          deepReq.canAccess = jest.fn().mockReturnValue(false)
        })

        it('does not add the action', async () => {
          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })
      })

      describe('with the correct permissions', () => {
        beforeEach(() => {
          deepReq.canAccess = jest.fn().mockReturnValue(true)
        })

        it('adds the action', async () => {
          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions).toContainEqual(deactivateCellAction)
        })

        it('does not add the action when location is inactive', async () => {
          deepRes.locals.decoratedResidentialSummary.location.active = false

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })

        it('does not add the action when location is not a CELL', async () => {
          deepRes.locals.decoratedResidentialSummary.location.raw.locationType = 'OFFICE'

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })
      })
    })
  })

  describe('actionButton', () => {
    beforeEach(() => {
      deepReq.canAccess = jest.fn().mockImplementation(permission => permission === 'convert_non_residential')
      deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
        active: true,
        isResidential: false,
        leafLevel: true,
      })
    })

    it('renders the page with the action button', () => {
      controller(deepReq as Request, deepRes as Response)

      expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
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
        deepReq.canAccess = jest.fn().mockReturnValue(false)
      })

      it('renders the page without the action button', () => {
        controller(deepReq as Request, deepRes as Response)

        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })

    describe('when inactive', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
          active: false,
          isResidential: false,
          leafLevel: true,
        })
      })

      it('renders the page without the action button', () => {
        controller(deepReq as Request, deepRes as Response)

        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })

    describe('when already residential', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
          active: true,
          isResidential: true,
          leafLevel: true,
        })
      })

      it('renders the page without the action button', () => {
        controller(deepReq as Request, deepRes as Response)

        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })

    describe('when not leaf level', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
          active: true,
          isResidential: false,
          leafLevel: false,
        })
      })

      it('renders the page without the action button', () => {
        controller(deepReq as Request, deepRes as Response)

        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: {},
        })
      })
    })
  })
})
