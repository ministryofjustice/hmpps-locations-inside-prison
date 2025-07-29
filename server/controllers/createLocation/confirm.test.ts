import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmCreateLocation from './confirm'
import fields from '../../routes/createLocation/fields'
import steps from '../../routes/createLocation/steps'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import LocationFactory from '../../testutils/factories/location'

describe('Confirm create location (WING)', () => {
  const controller = new ConfirmCreateLocation({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const next = jest.fn()
  let sessionModelData: { [key: string]: any }

  let locationsService: jest.Mocked<LocationsService>
  let analyticsService: jest.Mocked<AnalyticsService>

  beforeEach(() => {
    sessionModelData = {
      locationType: 'WING',
      localName: 'West Wing',
      structureLevels: ['LANDING', 'CELL'],
      locationCode: 'WW',
    }

    locationsService = {
      createWing: jest.fn().mockResolvedValue(
        LocationFactory.build({
          id: 'uuid-123',
          prisonId: 'TST',
          code: 'WW',
          pathHierarchy: 'WW',
          localName: 'West Wing',
          wingStructure: ['WING', 'LANDING', 'CELL'],
          locationType: 'WING',
        }),
      ),
      getLocationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getAccommodationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getConvertedCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getSpecialistCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getUsedForType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
    } as unknown as jest.Mocked<LocationsService>

    analyticsService = {
      sendEvent: jest.fn(),
    } as unknown as jest.Mocked<AnalyticsService>

    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {
          fields,
          steps,
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
      body: {},
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        options: deepReq.form.options,
        user: {
          username: 'JTIMPSON',
        },
        values: {
          locationType: 'WING',
          structureLevels: ['LANDING', 'CELL'],
        },
      },
      redirect: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns correct locals including decoratedLocationStructure and links', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual(
        expect.objectContaining({
          decoratedLocationStructure: 'Wing → Landings → Cells',
          createStructureLink: '/create-new/TST/structure',
          createDetailsLink: '/create-new/TST/details',
        }),
      )
    })
  })

  describe('saveValues', () => {
    it('calls locationsService and updates res.locals', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.createWing).toHaveBeenCalledWith(
        'token',
        'TST',
        'WW',
        ['WING', 'LANDING', 'CELL'],
        'West Wing',
      )

      expect(sessionModelData.newLocation).toEqual(
        expect.objectContaining({
          id: 'uuid-123',
          code: 'WW',
          prisonId: 'TST',
        }),
      )

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(
        deepReq,
        'create_WING_location',
        expect.objectContaining({
          prison_id: 'TST',
          code: 'WW',
          localName: 'West Wing',
        }),
      )
    })

    it('calls next with error if Api error', async () => {
      const error = new Error('some error')
      locationsService.createWing.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(async () => {
      sessionModelData.newLocation = await locationsService.createWing('', '', '', [])
    })

    it('resets the journey model', async () => {
      const { newLocation } = sessionModelData
      newLocation.localName = undefined

      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'resolved.WING created',
        content: 'You have created resolved.wing WW.',
      })

      expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/TST/${newLocation.id}`)
    })

    it('flashes success with localName if available', async () => {
      sessionModelData.newLocation.localName = 'West Wing'

      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'resolved.WING created',
        content: 'You have created resolved.wing West Wing.',
      })
    })
  })
})

describe('Confirm create location (LANDING)', () => {
  const controller = new ConfirmCreateLocation({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const next = jest.fn()
  let sessionModelData: { [key: string]: any }

  let locationsService: jest.Mocked<LocationsService>
  let analyticsService: jest.Mocked<AnalyticsService>

  beforeEach(() => {
    sessionModelData = {
      locationType: 'LANDING',
      localName: 'North Landing',
      locationCode: 'NL',
      locationId: 'parentId',
    }

    locationsService = {
      createCells: jest.fn().mockResolvedValue(
        LocationFactory.build({
          id: 'uuid-123',
          prisonId: 'TST',
          code: 'NL',
          pathHierarchy: 'WW-NL',
          localName: 'North Landing',
          locationType: 'LANDING',
        }),
      ),
      getLocationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getAccommodationType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getConvertedCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getSpecialistCellType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
      getUsedForType: jest.fn((_token: string, str: string) => Promise.resolve(`resolved.${str}`)),
    } as unknown as jest.Mocked<LocationsService>

    analyticsService = {
      sendEvent: jest.fn(),
    } as unknown as jest.Mocked<AnalyticsService>

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
      body: {},
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        locationId: '7e570000-0000-1000-8000-000000000001',
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          locationType: 'LANDING',
        },
      },
      redirect: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns correct locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual(
        expect.objectContaining({
          createDetailsLink: '/create-new/7e570000-0000-1000-8000-000000000001/details',
        }),
      )
    })
  })

  describe('saveValues', () => {
    it('calls locationsService and updates res.locals', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.createCells).toHaveBeenCalledWith('token', {
        accommodationType: 'NORMAL_ACCOMMODATION',
        cells: [],
        cellsUsedFor: [],
        newLevelAboveCells: {
          levelCode: 'NL',
          levelLocalName: 'North Landing',
          locationType: 'LANDING',
        },
        parentLocation: 'parentId',
        prisonId: 'TST',
      })

      expect(sessionModelData.newLocation).toEqual(await locationsService.createCells('', {} as any))

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(
        deepReq,
        'create_LANDING_location',
        expect.objectContaining({
          prison_id: 'TST',
          code: 'WW-NL',
          localName: 'North Landing',
        }),
      )
    })

    it('calls next with error if Api error', async () => {
      const error = new Error('some error')
      locationsService.createCells.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(async () => {
      sessionModelData.newLocation = await locationsService.createCells('', {} as any)
    })

    it('resets the journey model', async () => {
      const { newLocation } = sessionModelData
      newLocation.localName = undefined

      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'resolved.LANDING created',
        content: 'You have created resolved.landing WW-NL.',
      })

      expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/TST/${newLocation.id}`)
    })

    it('flashes success with localName if available', async () => {
      sessionModelData.newLocation.localName = 'North Landing'

      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'resolved.LANDING created',
        content: 'You have created resolved.landing North Landing.',
      })
    })
  })
})
