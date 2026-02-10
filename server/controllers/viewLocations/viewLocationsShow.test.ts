import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import controller from './viewLocationsShow'
import { addActions } from '../../routes/viewLocationsRouter'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('view locations show', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const convertToNonResAction = {
    text: 'Convert cell to non-residential room',
    href: '/location/7e570000-0000-0000-0000-000000000001/non-residential-conversion',
    class: 'govuk-button--secondary',
  }

  const deactivateCellAction = {
    text: 'Deactivate cell',
    href: '/location/7e570000-0000-0000-0000-000000000001/deactivate',
    class: 'govuk-button--secondary',
  }

  const deleteWingAction = {
    text: 'Delete wing',
    href: '/delete-draft/7e570000-0000-0000-0000-000000000001',
    class: 'govuk-button--warning',
  }

  beforeEach(() => {
    deepReq = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
      featureFlags: {},
    }
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          location: buildDecoratedLocation({ isResidential: true, leafLevel: true }),
          subLocationName: 'Landings',
        },
      },
      render: jest.fn(),
    }
  })

  it('renders the page', () => {
    controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      banner: undefined,
      minLayout: 'three-quarters',
      title: 'Manage residential locations',
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
      minLayout: 'three-quarters',
      title: 'Manage residential locations',
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

        it('does not add the action when location status is LOCKED_ACTIVE', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            active: true,
            isResidential: true,
            leafLevel: true,
            status: 'LOCKED_ACTIVE',
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

        it('does not add the action when location status is LOCKED_ACTIVE', async () => {
          deepRes.locals.decoratedResidentialSummary.location.status = 'LOCKED_ACTIVE'

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(deactivateCellAction)
        })
      })
    })

    describe('delete wing', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
          active: false,
          status: 'DRAFT',
          locationType: 'WING',
        })
      })

      describe('without the correct permissions', () => {
        beforeEach(() => {
          deepReq.canAccess = jest.fn().mockReturnValue(false)
        })

        it('does not add the action', async () => {
          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(deleteWingAction)
        })
      })

      describe('with the correct permissions', () => {
        beforeEach(() => {
          deepReq.canAccess = jest.fn().mockReturnValue(true)
        })

        it('adds the action', async () => {
          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions).toContainEqual(deleteWingAction)
        })

        it('does not add the action when location is active', async () => {
          deepRes.locals.decoratedResidentialSummary.location.active = true
          deepRes.locals.decoratedResidentialSummary.location.status = 'ACTIVE'

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(deleteWingAction)
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

      expect(deepRes.locals.actions).toEqual([
        {
          class: 'govuk-button--secondary',
          text: 'Convert to cell',
          href: `/location/7e570000-0000-0000-0000-000000000001/cell-conversion`,
        },
      ])
      expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
        banner: undefined,
        minLayout: 'three-quarters',
        title: 'Manage residential locations',
      })
    })

    describe('without the correct permissions', () => {
      beforeEach(() => {
        deepReq.canAccess = jest.fn().mockReturnValue(false)
      })

      it('renders the page without the action button', () => {
        controller(deepReq as Request, deepRes as Response)

        expect(deepRes.locals.actions).toEqual(undefined)
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage residential locations',
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

        expect(deepRes.locals.actions).toEqual(undefined)
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage residential locations',
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

        expect(deepRes.locals.actions).toEqual(undefined)
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage residential locations',
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

        expect(deepRes.locals.actions).toEqual(undefined)
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage residential locations',
        })
      })
    })

    describe('when location status is LOCKED', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
          active: true,
          isResidential: false,
          leafLevel: true,
          status: 'LOCKED_ACTIVE',
        })
      })

      it('renders the page without the action button', () => {
        controller(deepReq as Request, deepRes as Response)

        expect(deepRes.locals.actions).toEqual(undefined)
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage locations',
        })
      })
    })
  })

  describe('createButton', () => {
    describe('when the location is leafLevel', () => {
      describe('when canAccess("create_location") is true', () => {
        beforeEach(() => {
          deepReq.canAccess = (permission: string) => permission === 'create_location'
        })

        it('renders the page without the create button', () => {
          controller(deepReq as Request, deepRes as Response)

          expect(deepRes.locals.actions).toEqual(undefined)
          expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
            banner: undefined,
            createButton: undefined,
            minLayout: 'three-quarters',
            title: 'Manage residential locations',
          })
        })
      })
    })

    describe('when the location is not leafLevel', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary.location.leafLevel = false
      })

      describe('when canAccess("create_location") is false', () => {
        it('renders the page without the create button', () => {
          controller(deepReq as Request, deepRes as Response)

          expect(deepRes.locals.actions).toEqual(undefined)
          expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
            banner: undefined,
            createButton: undefined,
            minLayout: 'three-quarters',
            title: 'Manage residential locations',
          })
        })
      })

      describe('when create_location is true', () => {
        beforeEach(() => {
          deepReq.canAccess = (permission: string) => permission === 'create_location'
        })

        describe('when location has a pending approval request', () => {
          beforeEach(() => {
            deepRes.locals.decoratedResidentialSummary.location.pendingApprovalRequestId = 'REQUEST-ID-0000-1000-8'
          })

          it('does not render the create button', () => {
            controller(deepReq as Request, deepRes as Response)

            expect(deepRes.locals.actions).toEqual(undefined)
            expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
              banner: undefined,
              createButton: undefined,
              minLayout: 'three-quarters',
              title: 'Manage residential locations',
            })
          })
        })

        describe('when location does not have a pending approval request', () => {
          beforeEach(() => {
            delete deepRes.locals.decoratedResidentialSummary.location.pendingApprovalRequestId
          })

          it('renders the create button', () => {
            controller(deepReq as Request, deepRes as Response)

            expect(deepRes.locals.actions).toEqual(undefined)
            expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
              banner: undefined,
              createButton: {
                attributes: {
                  'data-qa': 'create-button',
                },
                classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
                href: '/create-new/7e570000-0000-0000-0000-000000000001',
                text: 'Create new landing',
              },
              minLayout: 'three-quarters',
              title: 'Manage residential locations',
            })
          })
        })
      })
    })
  })
})
