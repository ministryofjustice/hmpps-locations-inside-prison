import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import Details from './details'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/changeLocalName/fields'
import AnalyticsService from '../../services/analyticsService'

describe('Change Local Name', () => {
  const controller = new Details({ route: '/' })
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
          localName: 'Local name',
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
          localName: 'Local name',
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
            value: 'Local name',
          },
        },
        validationErrors: [],
      })
    })
  })

  describe('validateFields', () => {
    it('if local name already exists, callback with error', async () => {
      req.form.values.localName = 'existing local name'
      locationsService.getLocationByLocalName = jest.fn().mockResolvedValue(true)

      const expectedError = controller.formError('localName', 'localNameExists')

      const callback = jest.fn()
      await controller.validateFields(req, res, callback)

      await controller.saveValues(req, res, next)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ localName: expectedError }))
    })
  })

  describe('saveValues', () => {
    it('changes a local name via the locations API', async () => {
      req.form.values.localName = 'changed local name'
      await controller.saveValues(req, res, next)
      expect(locationsService.updateLocalName).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'changed local name',
        'JTIMPSON',
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'change_local_name', { prison_id: 'TST' })
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
        content: 'You have changed the local name.',
        title: 'Local name changed',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
  })
})
