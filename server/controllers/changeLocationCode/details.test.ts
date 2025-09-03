import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import fields from '../../routes/createLocation/fields'

describe('Change Location Code', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const decoratedResidentialSummaryMock: DeepPartial<any> = {
    location: {
      id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      prisonId: 'TST',
      locationType: 'WING',
      displayName: 'A-Wing',
      status: 'INACTIVE',
      active: false,
      code: 'A',
      level: 1,
    },
  }

  const locationHierarchyMock = [
    {
      id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      prisonId: 'ABC',
      code: 'TEST',
      type: 'WING',
      pathHierarchy: 'A',
      level: 1,
    },
  ]

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
        locationHierarchy: locationHierarchyMock,
        prisonId: 'TST',
        locationId: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      },
      redirect: jest.fn(),
    }

    next = jest.fn()

    locationsService.getResidentialSummary = jest.fn().mockResolvedValue({
      subLocations: [
        { locationType: 'WING', code: 'WING1' },
        { locationType: 'WING', code: 'WING2' },
      ],
    })
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
      deepRes.locals.locationHierarchy = [
        { pathHierarchy: 'A' },
        { pathHierarchy: 'A-1', locationType: 'LANDING' },
      ] as DeepPartial<typeof deepRes.locals.locationHierarchy>
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
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
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

    it('calls back with error if locationCode exists on a sibling', async () => {
      locationsService.getResidentialHierarchyForParent = jest.fn().mockResolvedValue([
        { locationType: 'LANDING', locationCode: 'LAND1' },
        { locationType: 'LANDING', locationCode: 'LAND2' },
      ])
      deepRes.locals.decoratedResidentialSummary.location.level = 2
      deepRes.locals.locationHierarchy = [
        {
          locationId: '019904bb-43b5-7291-9834-d1b7682ccf2a',
          locationType: 'WING',
          locationCode: 'WING1',
          fullLocationPath: '',
          level: 1,
          status: 'DRAFT',
        },
        {
          locationId: '0198f114-6042-7083-95bc-9e5fc5b0bdfa',
          locationType: 'LANDING',
          locationCode: 'LAND2',
          fullLocationPath: '',
          level: 2,
          status: 'DRAFT',
        },
      ] as DeepPartial<any>
      deepReq.form.values.locationCode = 'LAND1'

      const expectedError = controller.formError('locationCode', 'taken')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ locationCode: expectedError }))
    })

    it('calls back with error if locationCode exists on the top level', async () => {
      deepRes.locals.decoratedResidentialSummary.location.level = 1
      deepReq.form.values.locationCode = 'WING1'

      const expectedError = controller.formError('locationCode', 'taken')
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ locationCode: expectedError }))
    })

    it('calls back without error if the locationCode is unique', async () => {
      locationsService.getResidentialHierarchyForParent = jest.fn().mockResolvedValue([{ locationCode: 'C' }])
      locationsService.getResidentialSummary = jest.fn().mockResolvedValue({
        subLocations: [{ pathHierarchy: 'C' }],
      })
      deepReq.form.values.locationCode = 'D'

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
      locationsService.updateLocationCode = jest.fn().mockResolvedValue(true)
    })

    it('calls locations API with correct arguments', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.updateLocationCode).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'WING4',
      )
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
      ;(locationsService.updateLocationCode as jest.Mock).mockRejectedValue(error)
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
