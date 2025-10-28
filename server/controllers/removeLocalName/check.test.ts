import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import Check from './check'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/changeLocalName/fields'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('RemoveLocalName', () => {
  const controller = new Check({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
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
        values: {
          localName: null,
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
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          prisonId: 'TST',
        }),
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          localName: null,
        },
      },
      redirect: jest.fn(),
    }

    next = jest.fn()

    locationsService.getLocation = jest.fn().mockResolvedValue(true)
    locationsService.updateLocalName = jest.fn().mockResolvedValue(true)
    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      deepRes.locals.decoratedLocation.localName = 'Wing A'

      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        buttonText: 'Remove name',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields: {
          localName: {
            component: 'govukCharacterCount',
            errorMessages: {
              required: 'Enter a local name',
              taken: 'A location with this name already exists',
            },
            validate: [
              'required',
              {
                fn: expect.any(Function),
                arguments: [30],
              },
            ],
            id: 'localName',
            name: 'localName',
            classes: 'govuk-!-width-three-quarters local-name-text-input',
            label: {
              text: 'Local name',
              classes: 'govuk-fieldset__legend--m govuk-!-display-none',
            },
            maxlength: 30,
            rows: 1,
            autocomplete: 'off',
            value: null,
          },
        },
        title: 'Are you sure you want to remove the local name?',
        titleCaption: 'Cell A-1-001',
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    it('removes a local name via the locations API', async () => {
      deepReq.form.values.localName = null
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.updateLocalName).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        null,
        'JTIMPSON',
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq as FormWizard.Request, 'remove_local_name', {
        prison_id: 'TST',
      })
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with any errors', async () => {
      const error = new Error('API error')
      ;(locationsService.updateLocalName as jest.Mock).mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
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
        content: 'You have removed the local name for this location.',
        title: 'Local name removed',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })
  })
})
