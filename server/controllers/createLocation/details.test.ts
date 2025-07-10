import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/createLocation/fields'
import AnalyticsService from '../../services/analyticsService'

describe('Create location (WING)', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

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
        unset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        decoratedLocation: {
          locationType: 'Wing',
        },
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          wingCode: null,
          localName: null,
        },
      },
      redirect: jest.fn(),
    }

    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      deepRes.locals.prisonId = 'TST'
      const { locationType } = deepRes.locals.decoratedLocation

      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: '/manage-locations/TST',
        cancelLink: '/manage-locations/TST',
        continueLink: `/manage-locations/TST/create-new-${locationType.toLowerCase()}/structure`,
        fields: {
          locationCode: {
            component: 'govukInput',
            classes: 'govuk-input--width-5 local-name-text-input',
            autocomplete: 'off',
            errorMessages: {},
            hint: {
              text: `The letter or number used to identify the location, for example ${locationType} A.`,
            },
            id: 'locationCode',
            label: {
              classes: 'govuk-label--m',
              for: 'locationCode',
              text: `${locationType} code`,
            },
            name: 'locationCode',
            rows: 1,
            value: undefined,
          },
          localName: {
            component: 'govukCharacterCount',
            errorMessages: {},
            hint: {
              text: 'This will change how the name displays on location lists but won’t change the location code.',
            },
            id: 'localName',
            name: 'localName',
            classes: 'govuk-!-width-one-half local-name-text-input',
            validate: [
              {
                fn: expect.any(Function),
                arguments: [30],
              },
            ],
            label: {
              text: 'Local name (optional)',
              for: 'localName',
              classes: 'govuk-label--m',
            },
            maxlength: 30,
            rows: 1,
            autocomplete: 'off',
            value: null,
          },
          levelType: {
            component: 'govukSelect',
            errorMessages: {},
            id: 'levelType',
            items: [
              {
                text: 'Set at runtime',
                value: 'Set at runtime',
              },
            ],
            name: 'levelType',
            value: undefined,
          },
        },
        validationErrors: [],
      })
    })
  })

  it('sets the correct backLink and cancelLink in locals', () => {
    const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
    expect(result.backLink).toBe('/manage-locations/TST')
    expect(result.cancelLink).toBe('/manage-locations/TST')
  })

  describe('locationCode validation', () => {
    it('calls callback with error if locationCode is missing', async () => {
      deepReq.form.values.locationCode = ''
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'locationCodeMissing'),
        }),
      )
    })

    it('calls callback with error if locationCode is too long', async () => {
      deepReq.form.values.locationCode = 'TOOLONG'
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'locationCodeLength'),
        }),
      )
    })

    it('calls callback with error if locationCode contains non alphanumeric characters', async () => {
      deepReq.form.values.locationCode = '!@£$%'
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'locationCodeAlphanumeric'),
        }),
      )
    })

    it('calls callback with error if locationCode already exists in residentialHierarchy', async () => {
      deepReq.form.values.locationCode = 'WING'
      locationsService.getResidentialHierarchy = jest
        .fn()
        .mockResolvedValue([{ locationCode: 'WING' }, { locationCode: 'CELL' }])

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(locationsService.getResidentialHierarchy).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'locationCodeExists'),
        }),
      )
    })

    it('passes validation when locationCode is valid and does not exist', async () => {
      deepReq.form.values.locationCode = 'VALID'
      locationsService.getResidentialHierarchy = jest.fn().mockResolvedValue([{ locationCode: 'OTHER' }])

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(locationsService.getResidentialHierarchy).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(
        expect.not.objectContaining({
          locationCode: expect.anything(),
        }),
      )
    })
  })

  describe('localName validation', () => {
    it('calls callback with error if localName already exists', async () => {
      deepReq.form.values.localName = 'Existing Local Name'
      locationsService.getLocationByLocalName = jest.fn().mockResolvedValue(true)

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(locationsService.getLocationByLocalName).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          localName: controller.formError('localName', 'localNameExists'),
        }),
      )
    })

    it('calls callback with no error if localName does not exist', async () => {
      deepReq.form.values.localName = 'New Local Name'
      locationsService.getLocationByLocalName = jest.fn().mockResolvedValue(false)

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(locationsService.getLocationByLocalName).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(expect.not.objectContaining({ localName: expect.anything() }))
    })
  })
})
