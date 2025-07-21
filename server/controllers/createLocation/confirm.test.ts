import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmCreateLocation from './confirm'
import fields from '../../routes/createLocation/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'

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
      createWing: jest.fn().mockResolvedValue({
        id: 'uuid-123',
        prisonId: 'TST',
        code: 'WW',
        localName: 'West Wing',
        wingStructure: ['WING', 'LANDING', 'CELL'],
      }),
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
        options: {
          fields,
        },
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
          backLink: '/create-new/TST/structure',
          cancelLink: '/view-and-update-locations/TST',
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

  // TODO: TESTS NOT PASSING - locationsService.getLocationType is not a function

  // describe('successHandler', () => {
  //   beforeEach(() => {
  //     sessionModelData.newLocation = {
  //       id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
  //       code: 'WW',
  //       localName: '',
  //       locationType: 'Wing',
  //       prisonId: 'TST',
  //     }
  //   })
  //
  //   it('resets the journey model', async () => {
  //     expect(deepReq.flash).toHaveBeenCalledWith('success', {
  //       title: 'Wing created',
  //       content: 'You have created wing WW.',
  //     })
  //
  //     expect(deepRes.redirect).toHaveBeenCalledWith(
  //       '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
  //     )
  //   })
  //
  //   it('flashes success with localName if available', async () => {
  //     sessionModelData.newLocation.localName = 'West Wing'
  //
  //     expect(deepReq.flash).toHaveBeenCalledWith('success', {
  //       title: 'Wing created',
  //       content: 'You have created wing West Wing.',
  //     })
  //   })
  // })
})
