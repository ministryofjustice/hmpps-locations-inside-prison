import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import fields from '../../routes/changeSanitation/fields'
import LocationFactory from '../../testutils/factories/location'

describe('Change sanitation', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const decoratedResidentialSummaryMock: DeepPartial<any> = {
    location: LocationFactory.build({ inCellSanitation: false, status: 'DRAFT' }),
  }

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {
          fields,
        },
        values: {
          inCellSanitation: 'YES',
        },
      },
      services: {
        analyticsService,
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(),
        reset: jest.fn(),
        unset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }

    deepRes = {
      locals: {
        errorlist: [],
        decoratedResidentialSummary: decoratedResidentialSummaryMock,
        prisonId: 'TST',
        locationId: decoratedResidentialSummaryMock.location.id,
      },
      redirect: jest.fn(),
    }

    next = jest.fn()
    analyticsService.sendEvent = jest.fn()
    locationsService.getResidentialSummary = jest
      .fn()
      .mockResolvedValue({ subLocations: [decoratedResidentialSummaryMock.location] })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        removeHeadingSpacing: true,
        buttonText: 'Save sanitation',
        cancelText: 'Cancel',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('validateFields', () => {
    it('redirects if the inCellSanitation has not changed', async () => {
      deepReq.form.values.inCellSanitation = 'NO'
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.values.inCellSanitation = 'YES'
      locationsService.patchLocation = jest.fn().mockResolvedValue(true)
    })

    it('calls locations API with correct arguments', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.patchLocation).toHaveBeenCalledWith('token', '7e570000-0000-0000-0000-000000000001', {
        inCellSanitation: true,
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_sanitation', {
        prison_id: 'TST',
        location_id: '7e570000-0000-0000-0000-000000000001',
      })
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with an error if API call fails', async () => {
      const error = new Error('API error')
      ;(locationsService.patchLocation as jest.Mock).mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })

    it('when active it calls super class saveValues', async () => {
      deepRes.locals.decoratedResidentialSummary.location.status = 'ACTIVE'
      const superSpy = jest.spyOn(Object.getPrototypeOf(controller), 'saveValues')
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(superSpy).toHaveBeenCalled()
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      deepReq.form.values.inCellSanitation = 'YES'
      deepRes.locals.decoratedResidentialSummary.location.status = 'DRAFT'
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('resets the journey model', () => {
      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Sanitation changed',
        content: 'You have changed sanitation for A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })
})
