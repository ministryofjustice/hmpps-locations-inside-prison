import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/createLocation/fields'
import AnalyticsService from '../../services/analyticsService'
import LocationFactory from '../../testutils/factories/location'
import { Location } from '../../data/types/locationsApi'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

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

      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toMatchObject({
        fields: {
          locationCode: {
            label: {
              text: 'Wing code',
            },
          },
          createCellsNow: {
            fieldset: {
              legend: {
                text: 'Do you want to create cells on the LOCATION_TYPE now?',
              },
            },
          },
        },
        title: 'Enter wing details',
        titleCaption: 'Create new wing',
      })
    })
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

      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toMatchObject({
        fields: {
          locationCode: {
            label: {
              text: 'Landing code',
            },
          },
          createCellsNow: {
            fieldset: {
              legend: {
                text: 'Do you want to create cells on the landing now?',
              },
            },
          },
        },
        title: 'Enter landing details',
        titleCaption: 'Create new landing',
      })
    })
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
