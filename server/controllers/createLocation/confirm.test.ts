import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmCreateLocation from './confirm'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import fields from '../../routes/createLocation/fields'

describe('Confirm create location (WING)', () => {
  const controller = new ConfirmCreateLocation({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      services: {
        locationsService,
        analyticsService,
      },
      sessionModel: {
        get: jest.fn((key: string) => {
          const values: Record<string, any> = {
            localName: 'West Wing',
            locationCode: 'WW',
            structureLevels: ['LANDING', 'CELL'],
          }
          return values[key]
        }),
        set: jest.fn(),
        unset: jest.fn(),
        reset: jest.fn(),
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
          localName: 'West Wing',
          locationCode: 'WW',
          structureLevels: ['LANDING', 'CELL'],
        },
      },
      redirect: jest.fn(),
    }

    next = jest.fn()

    locationsService.createWing = jest.fn().mockResolvedValue({
      id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      prisonId: 'TST',
      code: 'WW',
      localName: 'West Wing',
      wingStructure: ['WING', 'LANDING', 'CELL'],
    })

    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns correct locals including decoratedFullStructure and displayLocalName', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual(
        expect.objectContaining({
          decoratedFullStructure: 'Wing → Landings → Cells',
          displayLocalName: 'West Wing',
          backLink: '/manage-locations/TST/create-new-wing/structure',
          detailsLink: '/manage-locations/TST/create-new-wing/details',
          cancelLink: '/manage-locations/TST',
        }),
      )
    })

    it('falls back to "Not set" if localName is empty', () => {
      deepRes.locals.values.localName = ''
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual(
        expect.objectContaining({
          displayLocalName: 'Not set',
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

      expect(deepRes.locals.decoratedLocation).toEqual(
        expect.objectContaining({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          code: 'WW',
          localName: 'West Wing',
        }),
      )

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(
        deepReq,
        'create_Wing_location',
        expect.objectContaining({
          prison_id: 'TST',
          code: 'WW',
          localName: 'West Wing',
        }),
      )

      expect(next).toHaveBeenCalled()
    })

    it('calls next with error if Api error', async () => {
      const error = new Error('some error')
      locationsService.createWing = jest.fn().mockRejectedValue(error)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      deepRes.locals.decoratedLocation = {
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        code: 'WW',
        localName: '',
        locationType: 'Wing',
        prisonId: 'TST',
      }

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('resets the journey model', () => {
      expect(deepReq.journeyModel!.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(deepReq.sessionModel!.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly with locationCode if localName is empty', () => {
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Wing created',
        content: 'You have created wing WW.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })

    describe('when localName is present', () => {
      beforeEach(() => {
        deepRes.locals.decoratedLocation.localName = 'West Wing'
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
      })

      it('sets the flash correctly with localName', () => {
        expect(deepReq.flash).toHaveBeenCalledWith('success', {
          title: 'Wing created',
          content: 'You have created wing West Wing.',
        })
      })
    })
  })
})
