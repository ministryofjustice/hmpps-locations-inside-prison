import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/createLocation/fields'
import AnalyticsService from '../../services/analyticsService'
import LocationFactory from '../../testutils/factories/location'
import alphanumeric from '../../validators/alphanumeric'
import { Location } from '../../data/types/locationsApi'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import lessThanOrEqualTo from '../../validators/lessThanOrEqualTo'

describe('Create location (WING)', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  let sessionModelData: { [key: string]: any }

  beforeEach(() => {
    sessionModelData = {
      locationType: 'WING',
    }
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
        set: (key: string, value: any) => {
          sessionModelData[key] = value
        },
        get: (key: string) => sessionModelData[key],
        reset: () => {
          sessionModelData = {}
        },
        unset: (key: string) => delete sessionModelData[key],
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        decoratedResidentialSummary: {
          subLocations: [buildDecoratedLocation(LocationFactory.build({ pathHierarchy: 'ABC01' }))],
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
    it('returns the correct locals', async () => {
      locationsService.getLocationType = jest.fn().mockResolvedValue('Wing')
      locationsService.getAccommodationType = jest.fn().mockResolvedValue('resolvedAccommodationType')
      locationsService.getConvertedCellType = jest.fn().mockResolvedValue('resolvedConvertedCellType')
      locationsService.getSpecialistCellType = jest.fn().mockResolvedValue('resolvedSpecialistCellType')
      locationsService.getUsedForType = jest.fn().mockResolvedValue('resolvedUsedForType')

      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: '/view-and-update-locations/TST',
        cancelLink: '/view-and-update-locations/TST',
        fields: {
          locationCode: {
            component: 'govukInput',
            classes: 'govuk-input--width-5 local-name-text-input',
            autocomplete: 'off',
            errorMessages: {
              alphanumeric: ':fieldName can only include numbers or letters',
            },
            hint: {
              text: `The letter or number used to identify the location, for example Wing A.`,
            },
            id: 'locationCode',
            label: {
              classes: 'govuk-label--m',
              for: 'locationCode',
              text: `Wing code`,
            },
            name: 'locationCode',
            rows: 1,
            validate: [
              'required',
              alphanumeric,
              {
                fn: expect.any(Function),
                arguments: [5],
              },
            ],
            value: undefined,
          },
          localName: {
            component: 'govukCharacterCount',
            errorMessages: {
              taken: 'A location with this name already exists',
            },
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
            value: undefined,
          },
          createCellsNow: {
            autocomplete: 'off',
            component: 'govukRadios',
            errorMessages: {
              required: 'Select yes if you want to create cells now',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'Do you want to create cells on the LOCATION_TYPE now?',
              },
            },
            hideWhenRemoved: true,
            id: 'createCellsNow',
            items: [
              {
                text: 'Yes',
                value: 'yes',
              },
              {
                text: "No, I'll create them later",
                value: 'no',
              },
            ],
            name: 'createCellsNow',
            remove: expect.any(Function),
            validate: ['required'],
            value: undefined,
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
          accommodationType: {
            component: 'govukRadios',
            validate: ['required'],
            hideWhenRemoved: true,
            id: 'accommodationType',
            name: 'accommodationType',
            errorMessages: {
              required: 'Select an accommodation type',
            },
            fieldset: {
              legend: {
                text: 'Accommodation type',
                classes: 'govuk-fieldset__legend--m',
              },
            },
            items: [
              { text: 'Normal accommodation', value: 'NORMAL_ACCOMMODATION' },
              { text: 'Care and separation', value: 'CARE_AND_SEPARATION' },
              { text: 'Healthcare inpatients', value: 'HEALTHCARE_INPATIENTS' },
            ],
            autocomplete: 'off',
          },
          cellsToCreate: {
            validate: ['required', 'numeric', lessThanOrEqualTo(999)],
            component: 'govukInput',
            errorMessages: {
              required: 'Enter how many cells you want to create',
              numeric: 'Cells must be a number',
              lessThanOrEqualTo: 'You can create a maximum of 999 cells at once',
            },
            id: 'cellsToCreate',
            name: 'cellsToCreate',
            classes: 'govuk-input--width-5',
            rows: 1,
            label: {
              text: 'How many cells do you want to create?',
              classes: 'govuk-label--m',
              for: 'cellsToCreate',
            },
            autocomplete: 'off',
          },
        },
        title: 'Enter wing details',
        titleCaption: 'Create new wing',
        validationErrors: [],
      })
    })
  })

  it('sets the correct backLink and cancelLink in locals', () => {
    const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
    expect(result.backLink).toBe('/view-and-update-locations/TST')
    expect(result.cancelLink).toBe('/view-and-update-locations/TST')
  })

  describe('locationCode validation', () => {
    it('calls callback with error if locationCode is missing', async () => {
      deepReq.form.values.locationCode = ''
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'required'),
        }),
      )
    })

    it('calls callback with error if locationCode is too long', async () => {
      deepReq.form.values.locationCode = 'TOOLONG'
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'maxLength', 5),
        }),
      )
    })

    it('calls callback with error if locationCode contains non alphanumeric characters', async () => {
      deepReq.form.values.locationCode = '!@£$%'
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'alphanumeric'),
        }),
      )
    })

    it('calls callback with error if locationCode already exists in subLocations', async () => {
      deepReq.form.values.locationCode = 'ABC01'

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'taken'),
        }),
      )
    })

    it('passes validation when locationCode is valid and does not exist', async () => {
      deepReq.form.values.locationCode = 'VALID'

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

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
          localName: controller.formError('localName', 'taken'),
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

    it('calls callback with error if localName is too long', async () => {
      deepReq.form.values.localName = 'TOOLONG'.repeat(5)
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          localName: controller.formError('localName', 'maxLength', 30),
        }),
      )
    })
  })
})

describe('Create location (LANDING)', () => {
  const controller = new Details({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  let sessionModelData: { [key: string]: any }
  let location: Location

  beforeEach(() => {
    location = LocationFactory.build({ locationType: 'LANDING', pathHierarchy: 'A' })
    sessionModelData = {
      locationType: 'LANDING',
      locationId: location.id,
    }
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
        set: (key: string, value: any) => {
          sessionModelData[key] = value
        },
        get: (key: string) => sessionModelData[key],
        reset: () => {
          sessionModelData = {}
        },
        unset: (key: string) => delete sessionModelData[key],
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        decoratedResidentialSummary: {
          location,
          subLocations: [buildDecoratedLocation(LocationFactory.build({ pathHierarchy: 'A-ABC01' }))],
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
    it('returns the correct locals', async () => {
      locationsService.getLocationType = jest.fn().mockResolvedValue('Landing')
      locationsService.getAccommodationType = jest.fn().mockResolvedValue('resolvedAccommodationType')
      locationsService.getConvertedCellType = jest.fn().mockResolvedValue('resolvedConvertedCellType')
      locationsService.getSpecialistCellType = jest.fn().mockResolvedValue('resolvedSpecialistCellType')
      locationsService.getUsedForType = jest.fn().mockResolvedValue('resolvedUsedForType')

      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: '/view-and-update-locations/TST',
        cancelLink: '/view-and-update-locations/TST',
        fields: {
          locationCode: {
            component: 'govukInput',
            classes: 'govuk-input--width-5 local-name-text-input',
            autocomplete: 'off',
            errorMessages: {
              alphanumeric: ':fieldName can only include numbers or letters',
            },
            formGroup: {
              beforeInput: {
                html: '<span class="govuk-label govuk-input-prefix--plain">A-</span>',
              },
            },
            hint: {
              text: `The letter or number used to identify the location, for example A-1.`,
            },
            id: 'locationCode',
            label: {
              classes: 'govuk-label--m',
              for: 'locationCode',
              text: `Landing code`,
            },
            name: 'locationCode',
            rows: 1,
            validate: [
              'required',
              alphanumeric,
              {
                fn: expect.any(Function),
                arguments: [5],
                type: 'maxLength',
              },
            ],
            value: undefined,
          },
          localName: {
            component: 'govukCharacterCount',
            errorMessages: {
              taken: 'A location with this name already exists',
            },
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
                type: 'maxLength',
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
            value: undefined,
          },
          createCellsNow: {
            autocomplete: 'off',
            component: 'govukRadios',
            errorMessages: {
              required: 'Select yes if you want to create cells now',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'Do you want to create cells on the landing now?',
              },
            },
            hideWhenRemoved: true,
            id: 'createCellsNow',
            items: [
              {
                text: 'Yes',
                value: 'yes',
              },
              {
                text: "No, I'll create them later",
                value: 'no',
              },
            ],
            name: 'createCellsNow',
            remove: expect.any(Function),
            validate: ['required'],
            value: undefined,
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
          accommodationType: {
            component: 'govukRadios',
            validate: ['required'],
            hideWhenRemoved: true,
            id: 'accommodationType',
            name: 'accommodationType',
            errorMessages: {
              required: 'Select an accommodation type',
            },
            fieldset: {
              legend: {
                text: 'Accommodation type',
                classes: 'govuk-fieldset__legend--m',
              },
            },
            items: [
              { text: 'Normal accommodation', value: 'NORMAL_ACCOMMODATION' },
              { text: 'Care and separation', value: 'CARE_AND_SEPARATION' },
              { text: 'Healthcare inpatients', value: 'HEALTHCARE_INPATIENTS' },
            ],
            autocomplete: 'off',
          },
          cellsToCreate: {
            validate: ['required', 'numeric', lessThanOrEqualTo(999)],
            component: 'govukInput',
            errorMessages: {
              required: 'Enter how many cells you want to create',
              numeric: 'Cells must be a number',
              lessThanOrEqualTo: 'You can create a maximum of 999 cells at once',
            },
            id: 'cellsToCreate',
            name: 'cellsToCreate',
            classes: 'govuk-input--width-5',
            rows: 1,
            label: {
              text: 'How many cells do you want to create?',
              classes: 'govuk-label--m',
              for: 'cellsToCreate',
            },
            autocomplete: 'off',
          },
        },
        title: 'Enter landing details',
        titleCaption: 'Create new landing',
        validationErrors: [],
      })
    })
  })

  it('sets the correct backLink and cancelLink in locals', () => {
    const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
    expect(result.backLink).toBe('/view-and-update-locations/TST')
    expect(result.cancelLink).toBe('/view-and-update-locations/TST')
  })

  describe('locationCode validation', () => {
    it('calls callback with error if locationCode is missing', async () => {
      deepReq.form.values.locationCode = ''
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'required'),
        }),
      )
    })

    it('calls callback with error if locationCode is too long', async () => {
      deepReq.form.values.locationCode = 'TOOLONG'
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'maxLength', 5),
        }),
      )
    })

    it('calls callback with error if locationCode contains non alphanumeric characters', async () => {
      deepReq.form.values.locationCode = '!@£$%'
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'alphanumeric'),
        }),
      )
    })

    it('calls callback with error if locationCode already exists in subLocations', async () => {
      deepReq.form.values.locationCode = 'ABC01'

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          locationCode: controller.formError('locationCode', 'taken'),
        }),
      )
    })

    it('passes validation when locationCode is valid and does not exist', async () => {
      deepReq.form.values.locationCode = 'VALID'

      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

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
          localName: controller.formError('localName', 'taken'),
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

    it('calls callback with error if localName is too long', async () => {
      deepReq.form.values.localName = 'TOOLONG'.repeat(5)
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          localName: controller.formError('localName', 'maxLength', 30),
        }),
      )
    })
  })
})
