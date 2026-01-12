import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import fields from '../../routes/changeDoorNumber/fields'
import LocationFactory from '../../testutils/factories/location'

describe('Change door number', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const decoratedResidentialSummaryMock: DeepPartial<any> = {
    location: LocationFactory.build({ cellMark: 'A1-02' }),
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
          doorNumber: 'A1-01',
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
    locationsService.getResidentialSummary = jest.fn().mockResolvedValue({ subLocations: [{ cellMark: 'A1-02' }] })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        removeHeadingSpacing: true,
        buttonText: 'Save door number',
        cancelText: 'Cancel',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('validateFields', () => {
    it('redirects if the cellMark has not changed', async () => {
      deepReq.form.values.doorNumber = decoratedResidentialSummaryMock.location.cellMark
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })

    it('calls back with error if the cellMark is not unique', async () => {
      locationsService.getResidentialSummary = jest.fn().mockResolvedValue({ subLocations: [{ cellMark: 'A1-01' }] })

      const expectedError = controller.formError('doorNumber', 'taken')
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ doorNumber: expectedError }))
    })

    it('calls back without error if the locationCode is unique', async () => {
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(callback).toHaveBeenCalledWith({})
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.values.doorNumber = 'A1-01'
      locationsService.patchLocation = jest.fn().mockResolvedValue(true)
    })

    it('calls locations API with correct arguments', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.patchLocation).toHaveBeenCalledWith('token', '7e570000-0000-0000-0000-000000000001', {
        cellMark: 'A1-01',
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_door_number', {
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
  })

  describe('successHandler', () => {
    beforeEach(() => {
      deepReq.form.values.locationCode = 'WING5'
      deepRes.locals.decoratedResidentialSummary.location.locationType = 'Wing'
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
        title: 'Cell door number changed',
        content: 'You have changed the door number for cell A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })
})
