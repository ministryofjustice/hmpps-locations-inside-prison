import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import Check from './check'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/changeLocalName/fields'
import AnalyticsService from '../../services/analyticsService'

describe('RemoveLocalName', () => {
  const controller = new Check({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
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
        authService,
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
    } as unknown as typeof req

    res = {
      locals: {
        errorlist: [],
        location: LocationFactory.build({
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
    } as unknown as typeof res

    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getLocation = jest.fn().mockResolvedValue(true)
    locationsService.updateLocalName = jest.fn().mockResolvedValue(true)
    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      res.locals.location.localName = 'Wing A'

      expect(controller.locals(req, res)).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields: {
          localName: {
            component: 'govukCharacterCount',
            errorMessages: {
              required: 'Enter a local name',
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
        localName: 'Wing A',
        pageTitleText: 'Are you sure you want to remove the local name?',
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    it('removes a local name via the locations API', async () => {
      req.form.values.localName = null
      await controller.saveValues(req, res, next)
      expect(locationsService.updateLocalName).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        null,
        'JTIMPSON',
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'remove_local_name', { prison_id: 'TST' })
    })

    it('calls next when successful', async () => {
      await controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with any errors', async () => {
      const error = new Error('API error')
      ;(locationsService.updateLocalName as jest.Mock).mockRejectedValue(error)
      await controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      controller.successHandler(req, res, next)
    })

    it('resets the journey model', () => {
      expect(req.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(req.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(req.flash).toHaveBeenCalledWith('success', {
        content: 'You have removed the local name for this location.',
        title: 'Local name removed',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
  })
})
