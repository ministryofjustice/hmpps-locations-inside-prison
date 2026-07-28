import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import controller, { addActions } from './index'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import paths from '../../utils/paths'
import LocationResidentialSummaryFactory from '../../testutils/factories/locationResidentialSummary'
import { LocationResidentialSummary } from '../../data/types/locationsApi'
import LocationFactory from '../../testutils/factories/location'
import { Page } from '../../services/auditService'

describe('view locations show', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let locationResidentialSummary: LocationResidentialSummary
  let convertToCellAction: any
  let convertToNonResAction: any
  let deactivateCellAction: any
  let deleteWingAction: any

  beforeEach(() => {
    locationResidentialSummary = LocationResidentialSummaryFactory.build()

    convertToCellAction = {
      text: 'Convert to cell',
      href: paths.location.cellConversion(buildDecoratedLocation(locationResidentialSummary.parentLocation)),
      class: 'govuk-button--secondary',
    }

    convertToNonResAction = {
      text: 'Convert cell to non-residential room',
      href: paths.location.nonResidentialConversion(buildDecoratedLocation(locationResidentialSummary.parentLocation)),
      class: 'govuk-button--secondary',
    }

    deactivateCellAction = {
      text: 'Deactivate cell',
      href: paths.location.deactivate(buildDecoratedLocation(locationResidentialSummary.parentLocation)),
      class: 'govuk-button--secondary',
    }

    deleteWingAction = {
      text: 'Delete wing',
      href: paths.location.delete(buildDecoratedLocation(locationResidentialSummary.parentLocation)),
      class: 'govuk-button--warning',
    }

    deepReq = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
      featureFlags: {},
      id: 'test-correlation-id',
      session: {
        systemToken: 'token',
      },
      services: {
        auditService: {
          logPageView: jest.fn().mockResolvedValue(undefined),
        },
        locationsService: {
          getPrisonConfiguration: jest.fn().mockResolvedValue({}),
          getResidentialSummary: jest.fn().mockResolvedValue(locationResidentialSummary),
          getLocationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getAccommodationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getConvertedCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getSpecialistCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getUsedForType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getDeactivatedReason: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
        },
        manageUsersService: {
          getUser: (_token: string, username: string) => {
            return Promise.resolve({ name: `Resolved ${username}`, username })
          },
        },
      },
    }
    deepRes = {
      locals: {
        prisonId: 'TST',
        locationId: '7e570000-0000-1000-8001-000000000001',
        user: {
          username: 'test-user',
        },
      },
      render: jest.fn(),
    }
  })

  it('renders the page', async () => {
    await controller(deepReq as Request, deepRes as Response)

    expect(deepReq.services.auditService.logPageView).toHaveBeenCalledWith(Page.LOCATIONS_SHOW, {
      who: 'test-user',
      correlationId: 'test-correlation-id',
    })
    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      banner: undefined,
      minLayout: 'three-quarters',
      title: 'Manage residential locations',
    })
  })

  it('renders the page with a banner', async () => {
    const success = {
      title: 'Your attention please',
      content: 'Dinner is served',
    }
    // @ts-expect-error: lint thinks that the jest.fn has 0 args
    deepReq.flash = jest.fn(_param => [success])
    await controller(deepReq as Request, deepRes as Response)

    expect(deepReq.services.auditService.logPageView).toHaveBeenCalledWith(Page.LOCATIONS_SHOW, {
      who: 'test-user',
      correlationId: 'test-correlation-id',
    })
    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
      banner: {
        success,
      },
      minLayout: 'three-quarters',
      title: 'Manage residential locations',
    })
  })

  describe('addActions', () => {
    beforeEach(() => {
      deepRes.locals.decoratedResidentialSummary = {
        location: buildDecoratedLocation(locationResidentialSummary.parentLocation),
        subLocationName: 'Landings',
      }
    })

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
            ...locationResidentialSummary.parentLocation,
            isResidential: false,
            leafLevel: true,
          })

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when not leaf level', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            ...locationResidentialSummary.parentLocation,
            isResidential: true,
            leafLevel: false,
          })

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when location is inactive', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            ...locationResidentialSummary.parentLocation,
            active: false,
            isResidential: true,
            leafLevel: true,
          })

          await addActions(deepReq as Request, deepRes as Response, jest.fn())

          expect(deepRes.locals.actions || []).not.toContainEqual(convertToNonResAction)
        })

        it('does not add the action when location status is LOCKED_ACTIVE', async () => {
          deepRes.locals.decoratedResidentialSummary.location = buildDecoratedLocation({
            ...locationResidentialSummary.parentLocation,
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
          ...locationResidentialSummary.parentLocation,
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
          deepReq.canAccess = jest.fn().mockImplementation(permission => permission === 'deactivate')
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
          ...locationResidentialSummary.parentLocation,
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
          deepReq.canAccess = jest.fn().mockImplementation(permission => permission === 'create_location')
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

      locationResidentialSummary.parentLocation.isResidential = false
    })

    it('renders the page with the action button', async () => {
      await controller(deepReq as Request, deepRes as Response)

      expect(deepRes.locals.actions).toEqual([convertToCellAction])
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

      it('renders the page without the action button', async () => {
        await controller(deepReq as Request, deepRes as Response)

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
        locationResidentialSummary.parentLocation.active = false
      })

      it('renders the page without the action button', async () => {
        await controller(deepReq as Request, deepRes as Response)

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
        locationResidentialSummary.parentLocation.isResidential = true
      })

      it('renders the page with the action button', async () => {
        await controller(deepReq as Request, deepRes as Response)

        expect(deepRes.locals.actions).toEqual([convertToNonResAction])
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage residential locations',
        })
      })
    })

    describe('when not leaf level', () => {
      beforeEach(() => {
        locationResidentialSummary.parentLocation.leafLevel = false
      })

      it('renders the page without the action button', async () => {
        await controller(deepReq as Request, deepRes as Response)

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
        locationResidentialSummary.parentLocation.status = 'LOCKED_ACTIVE'
      })

      it('renders the page without the action button', async () => {
        await controller(deepReq as Request, deepRes as Response)

        expect(deepRes.locals.actions).toEqual(undefined)
        expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
          banner: undefined,
          minLayout: 'three-quarters',
          title: 'Manage residential locations',
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

        it('renders the page without the create button', async () => {
          await controller(deepReq as Request, deepRes as Response)

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
        locationResidentialSummary.parentLocation.leafLevel = false
      })

      describe('when canAccess("create_location") is false', () => {
        it('renders the page without the create button', async () => {
          await controller(deepReq as Request, deepRes as Response)

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
            locationResidentialSummary.parentLocation.pendingApprovalRequestId = 'REQUEST-ID-0000-1000-8'
          })

          it('does not render the create button', async () => {
            await controller(deepReq as Request, deepRes as Response)

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
            delete locationResidentialSummary.parentLocation.pendingApprovalRequestId
          })

          it('renders the create button', async () => {
            await controller(deepReq as Request, deepRes as Response)

            expect(deepRes.locals.actions).toEqual(undefined)
            expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
              createButton: {
                attributes: {
                  'data-qa': 'create-button',
                },
                classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
                href: paths.location.create('TST', '7e570000-0000-1000-8001-000000000001'),
                text: 'Create new landing',
              },
              minLayout: 'three-quarters',
              title: 'Manage residential locations',
            })
          })

          describe('when sub-location is Cells', () => {
            beforeEach(() => {
              locationResidentialSummary.subLocationName = 'Cells'
            })

            it('renders Edit cells when all cells are DRAFT', async () => {
              locationResidentialSummary.subLocations = [
                LocationFactory.build({ status: 'DRAFT' }),
                LocationFactory.build({ status: 'DRAFT' }),
              ]

              await controller(deepReq as Request, deepRes as Response)

              expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
                createButton: {
                  attributes: {
                    'data-qa': 'create-button',
                  },
                  classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
                  href: paths.location.editCells('TST', '7e570000-0000-1000-8001-000000000001'),
                  text: 'Edit cells',
                },
                minLayout: 'three-quarters',
                title: 'Manage residential locations',
              })
            })

            it('renders Edit draft cells when there are DRAFT and non-DRAFT cells', async () => {
              locationResidentialSummary.subLocations = [
                LocationFactory.build({ status: 'DRAFT' }),
                LocationFactory.build({ status: 'ACTIVE' }),
              ]

              await controller(deepReq as Request, deepRes as Response)

              expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/show', {
                createButton: {
                  attributes: {
                    'data-qa': 'create-button',
                  },
                  classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
                  href: paths.location.editCells('TST', '7e570000-0000-1000-8001-000000000001'),
                  text: 'Edit draft cells',
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
})

describe('view locations index', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      canAccess: jest.fn().mockReturnValue(false),
      flash: jest.fn(),
      featureFlags: {},
      id: 'test-correlation-id',
      session: {
        systemToken: 'token',
      },
      services: {
        auditService: {
          logPageView: jest.fn().mockResolvedValue(undefined),
        },
        locationsService: {
          getPrisonConfiguration: jest.fn().mockResolvedValue({}),
          getResidentialSummary: jest.fn().mockResolvedValue(LocationResidentialSummaryFactory.build()),
          getLocationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getAccommodationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getConvertedCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getSpecialistCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getUsedForType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
          getDeactivatedReason: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
        },
        manageUsersService: {
          getUser: (_token: string, username: string) => {
            return Promise.resolve({ name: `Resolved ${username}`, username })
          },
        },
      },
    }
    deepRes = {
      locals: {
        prisonId: 'TST',
        user: {
          username: 'test-user',
        },
      },
      render: jest.fn(),
    }
  })

  it('renders the index page without create button when cannot create locations', async () => {
    deepReq.canAccess = jest.fn().mockReturnValue(false)

    await controller(deepReq as Request, deepRes as Response)

    expect(deepReq.services.auditService.logPageView).toHaveBeenCalledWith(Page.LOCATIONS_INDEX, {
      who: 'test-user',
      correlationId: 'test-correlation-id',
    })
    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/index', {
      title: 'Manage residential locations',
      minLayout: 'three-quarters',
    })
  })

  it('renders the index page with create button when can create locations', async () => {
    deepReq.canAccess = jest.fn().mockImplementation(permission => permission === 'create_location')

    await controller(deepReq as Request, deepRes as Response)

    expect(deepReq.services.auditService.logPageView).toHaveBeenCalledWith(Page.LOCATIONS_INDEX, {
      who: 'test-user',
      correlationId: 'test-correlation-id',
    })
    expect(deepRes.render).toHaveBeenCalledWith('pages/viewLocations/index', {
      title: 'Manage residential locations',
      minLayout: 'three-quarters',
      createButton: {
        text: 'Create new landing',
        href: paths.location.create('TST'),
        classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
        attributes: {
          'data-qa': 'create-button',
        },
      },
    })
  })
})
