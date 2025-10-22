import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import Details from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/changeLocalName/fields'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('Change Local Name', () => {
  const controller = new Details({ route: '/' })
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
          localName: 'Local name',
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
          localName: 'Local name',
        },
      },
      redirect: jest.fn(),
    }

    next = jest.fn()

    locationsService.getLocation = jest.fn().mockResolvedValue(true)
    locationsService.updateLocalName = jest.fn().mockResolvedValue(true)
    locationsService.getLocationByLocalName = jest.fn()
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
        buttonText: 'Save name',
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
            value: 'Local name',
          },
        },
        insetText:
          'This will change how the name displays on location lists but won’t change the location code (for example A-1-001).',
        title: 'Change local name',
        titleCaption: 'Cell A-1-001',
        validationErrors: [],
      })
    })
  })

  it('sets the correct backLink and cancelLink in locals', () => {
    const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
    expect(result.backLink).toBe('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    expect(result.cancelLink).toBe('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
  })

  it('sets the localName value from res if not in req', () => {
    delete deepReq.form.values.localName
    deepRes.locals.decoratedLocation.localName = 'Local Name from response'
    const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
    expect((result.fields as FormWizard.Fields).localName.value).toBe('Local Name from response')
  })

  describe('validateFields', () => {
    it('calls back with error if local name already exists', async () => {
      deepReq.form.values.localName = 'existing local name'
      locationsService.getLocationByLocalName = jest.fn().mockResolvedValue(true)

      const expectedError = controller.formError('localName', 'taken')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ localName: expectedError }))
    })

    it('calls back with validation error if localName is null, ', async () => {
      deepReq.form.values.localName = ''
      locationsService.getLocationByLocalName = jest.fn().mockResolvedValue(false)

      const expectedError = controller.formError('localName', 'required')

      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ localName: expectedError }))
    })
  })

  describe('errorCases', () => {
    it('if errorCode is 101, callback', async () => {
      deepReq.form.values.localName = 'Local Name'
      const errorsWith101 = new Error('Location not found')
      locationsService.getLocationByLocalName = jest.fn().mockRejectedValue(errorsWith101)
      const callback = jest.fn()

      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(locationsService.getLocationByLocalName).toHaveBeenCalled()
    })

    it('if errorCode is not 101, callback', async () => {
      deepReq.form.values.localName = 'Local Name'
      const genericError = new Error('Some other error')
      locationsService.getLocationByLocalName = jest.fn().mockRejectedValue(genericError)
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(locationsService.getLocationByLocalName).toHaveBeenCalled()
    })
  })

  describe('saveValues', () => {
    it('does not call locations API if localName is null ', async () => {
      deepReq.form.values.localName = ''
      deepRes.locals.decoratedLocation.localName = 'Wing A'
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(locationsService.getLocationByLocalName).not.toHaveBeenCalled()
      expect(locationsService.updateLocalName).not.toHaveBeenCalled()
    })

    it('does not call locations API if localName has not changed', async () => {
      deepReq.form.values.localName = 'Wing A'
      deepRes.locals.decoratedLocation.localName = 'Wing A'
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      expect(locationsService.getLocationByLocalName).not.toHaveBeenCalled()
      expect(locationsService.updateLocalName).not.toHaveBeenCalled()
    })

    it('calls locations API if localName has been changed', async () => {
      deepRes.locals.decoratedLocation.localName = 'old Local Name'
      deepReq.form.values.localName = 'changed local name'
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.getLocationByLocalName).toHaveBeenCalledWith(
        'token',
        'TST',
        'changed local name',
        '57718979-573c-433a-9e51-2d83f887c11c',
      )
      expect(locationsService.updateLocalName).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'changed local name',
        'JTIMPSON',
      )
    })

    it('sanitizes localName before calling locations API', async () => {
      deepReq.form.values.localName = '  <br> Sanitized Wing Name </br>  '
      const callback = jest.fn()
      await controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.getLocationByLocalName).toHaveBeenCalledWith(
        'token',
        'TST',
        'Sanitized Wing Name',
        '57718979-573c-433a-9e51-2d83f887c11c',
      )
      expect(locationsService.updateLocalName).toHaveBeenCalledWith(
        'token',
        deepRes.locals.decoratedLocation.id,
        'Sanitized Wing Name',
        deepRes.locals.user.username,
      )

      expect(next).toHaveBeenCalled()
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_local_name', { prison_id: 'TST' })
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
        content: 'You have changed the local name.',
        title: 'Local name changed',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })
  })
})
