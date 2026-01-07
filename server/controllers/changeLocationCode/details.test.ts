import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import fields from '../../routes/changeLocationCode/fields'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import LocationFactory from '../../testutils/factories/location'

describe('Change Location Code', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const decoratedResidentialSummaryMock: DeepPartial<any> = {
    location: buildDecoratedLocation({
      id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      prisonId: 'TST',
      locationType: 'WING',
      localName: 'A-Wing',
      status: 'INACTIVE',
      active: false,
      code: 'A',
      key: 'WINGA',
      level: 1,
    }),
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
        values: {},
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
        locationId: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      },
      redirect: jest.fn(),
    }

    next = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals for wing', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.locationType).toBe('wing')
      expect(result.titleCaption).toBe('A-Wing')
      expect(result.title).toBe('Change wing code')
      expect((deepReq.form.options.fields.locationCode.hint as { text: string }).text).toBe(
        'The letter or number used to identify the location, for example Wing A.',
      )
      expect(deepReq.form.options.fields.locationCode.value).toBe('A')
    })

    it('returns the correct locals for a non-top-level location', () => {
      deepRes.locals.decoratedResidentialSummary.location.locationType = 'LANDING'
      deepRes.locals.decoratedResidentialSummary.location.level = 2
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result.locationType).toBe('landing')
      expect(result.title).toBe('Change landing code')

      expect((deepReq.form.options.fields.locationCode.hint as { text: string }).text).toBe(
        'The letter or number used to identify the location, for example A-1.',
      )
    })
  })

  describe('validateFields', () => {
    it('redirects if the location code has not changed', async () => {
      deepReq.form.values.locationCode = decoratedResidentialSummaryMock.location.code
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })

    it('calls back with error if locationCode is missing', async () => {
      deepReq.form.values.locationCode = ''
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ locationCode: controller.formError('locationCode', 'required') }),
      )
    })

    it('calls back with error if locationCode is too long', async () => {
      deepReq.form.values.locationCode = 'TOOLONG'
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ locationCode: controller.formError('locationCode', 'maxLength', 5) }),
      )
    })

    it('calls back with error if locationCode contains non alphanumeric characters', async () => {
      deepReq.form.values.locationCode = '!@£$%'
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ locationCode: controller.formError('locationCode', 'alphanumeric') }),
      )
    })

    it('calls back with error if a locationCode exists', async () => {
      deepReq.form.values.locationCode = 'WINGA'
      locationsService.getLocationByKey = jest.fn().mockResolvedValue({ code: 'WINGA' })

      const expectedError = controller.formError('locationCode', 'taken')
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ locationCode: expectedError }))
    })

    it('calls back without error if the locationCode is unique', async () => {
      deepReq.form.values.locationCode = 'WINGD'
      locationsService.getLocationByKey = jest.fn()

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(callback).toHaveBeenCalledWith({})
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.values.locationCode = 'WING4'
      deepRes.locals.decoratedResidentialSummary.location.code = 'WING3'
      locationsService.patchLocation = jest.fn().mockResolvedValue(
        LocationFactory.build({
          ...deepRes.locals.decoratedResidentialSummary.location.raw,
          code: 'WING4',
        }),
      )
    })

    it('calls locations API with correct arguments', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.patchLocation).toHaveBeenCalledWith('token', 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2', {
        code: 'WING4',
      })
    })

    describe('when location is a cell', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary = {
          ...deepRes.locals.decoratedResidentialSummary,
          location: buildDecoratedLocation({
            ...deepRes.locals.decoratedResidentialSummary.location.raw,
            locationType: 'CELL',
          }),
        }
      })

      it('pads a single digit location code to 3 digits', async () => {
        deepReq.form.values.locationCode = '1'
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
        expect(locationsService.patchLocation).toHaveBeenLastCalledWith(
          'token',
          'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          {
            code: '001',
          },
        )
      })
    })

    describe('when location is not a cell', () => {
      it('does not pad a single digit location code to 3 digits', async () => {
        deepReq.form.values.locationCode = '1'
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
        expect(locationsService.patchLocation).toHaveBeenLastCalledWith(
          'token',
          'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          {
            code: '1',
          },
        )
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_location_code', {
        prison_id: 'TST',
        location_id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
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
    describe('when location is a cell', () => {
      beforeEach(() => {
        deepRes.locals.decoratedResidentialSummary = {
          ...deepRes.locals.decoratedResidentialSummary,
          location: buildDecoratedLocation({
            ...deepRes.locals.decoratedResidentialSummary.location.raw,
            locationType: 'CELL',
            pathHierarchy: 'A-1-001',
          }),
        }

        deepReq.form.values.locationCode = '003'
        deepRes.locals.decoratedResidentialSummary.location.locationType = 'Wing'
        deepReq.sessionModel.get = jest.fn().mockReturnValue(
          LocationFactory.build({
            ...deepRes.locals.decoratedResidentialSummary.location.raw,
            pathHierarchy: 'A-1-003',
          }),
        )
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
          title: 'Cell number changed',
          content: 'You have changed the cell number for A-1-003.',
        })
      })

      it('redirects to the view location page', () => {
        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        )
      })
    })

    describe('when location is not a cell', () => {
      beforeEach(() => {
        deepReq.form.values.locationCode = 'WING5'
        deepRes.locals.decoratedResidentialSummary.location.locationType = 'Wing'
        deepReq.sessionModel.get = jest.fn().mockReturnValue(
          LocationFactory.build({
            ...deepRes.locals.decoratedResidentialSummary.location.raw,
            pathHierarchy: 'WING5',
          }),
        )
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
          title: 'Wing code changed',
          content: 'You have changed the wing code for WING5.',
        })
      })

      it('redirects to the view location page', () => {
        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        )
      })
    })
  })
})
