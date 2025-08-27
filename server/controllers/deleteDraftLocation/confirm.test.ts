import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmDeleteDraftLocation from './confirm'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import { TypedLocals } from '../../@types/express'

describe('ConfirmDeleteDraftLocation', () => {
  const controller = new ConfirmDeleteDraftLocation({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  const locationId = 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2'
  const prisonId = 'TST'
  const parentId = '57718979-573c-433a-9e51-2d83f887c11c'

  beforeEach(() => {
    deepReq = {
      services: {
        analyticsService,
        locationsService,
      },
      session: {
        systemToken: 'token',
      },
      journeyModel: {
        reset: jest.fn(),
      },
      sessionModel: {
        reset: jest.fn(),
      },
      flash: jest.fn(),
    }

    deepRes = {
      locals: {
        user: { username: 'username' },
        locationId,
        prisonId,
        decoratedResidentialSummary: {
          location: buildDecoratedLocation({
            id: locationId,
            prisonId,
            locationType: 'WING',
            localName: undefined,
            capacity: {
              maxCapacity: 2,
              workingCapacity: 1,
            },
            parentId,
          }),
        },
      },
      redirect: jest.fn(),
    }

    next = jest.fn()

    locationsService.deleteDraftLocation = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('sets the correct locals', () => {
      const locals = controller.locals(deepReq as FormWizard.Request, deepRes as Response) as TypedLocals
      expect(locals.backLink).toEqual(`/view-and-update-locations/TST/${locationId}`)
      expect(locals.cancelLink).toEqual(`/view-and-update-locations/${prisonId}/${locationId}`)
      expect(locals.locationType).toEqual('wing')
    })
  })

  describe('saveValues', () => {
    it('deletes the draft location via locationsService API', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.deleteDraftLocation).toHaveBeenCalledWith('token', locationId)
    })

    it('sends an analytics event when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'delete_draft_location', {
        prison_id: prisonId,
        location_id: locationId,
      })
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      locationsService.deleteDraftLocation.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    it('redirects to the draft parent location if one exists', () => {
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Wing deleted',
        content: 'You have deleted wing A-1-001.',
      })
      expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/${prisonId}/${parentId}`)
    })

    it('redirects to the view locations screen if no draft parent exists', () => {
      deepRes.locals.decoratedResidentialSummary.location.parentId = null
      deepRes.locals.decoratedResidentialSummary.location.displayName = 'Wing A'

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Wing deleted',
        content: 'You have deleted Wing A.',
      })
      expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/${prisonId}`)
    })
  })
})
