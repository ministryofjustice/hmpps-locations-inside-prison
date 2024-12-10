import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeUsedForDetails from './details'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/changeUsedFor/fields'
import AnalyticsService from '../../services/analyticsService'

describe('ChangeUsedForDetails', () => {
  const controller = new ChangeUsedForDetails({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

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
          usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
        },
      },
      services: {
        analyticsService,
        authService,
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              usedFor: [{ text: 'Remand', value: 'REMAND' }],
            })[fieldName],
        ),
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
          localName: 'A-1-001',
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
          usedFor: [
            {
              value: 'REMAND',
              text: 'Remand',
            },
          ],
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res

    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getUsedForTypes = jest.fn().mockResolvedValue([
      { key: 'REMAND', description: 'Remand' },
      { key: 'THERAPEUTIC_COMMUNITY', description: 'Therapeutic community' },
    ])
    locationsService.updateUsedForTypes = jest.fn().mockResolvedValue(true)
    analyticsService.sendEvent = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(req, res, next)
    })

    it('sets the correct checkbox items', () => {
      expect(req.form.options.fields.usedFor.items).toEqual([
        {
          value: 'REMAND',
          text: 'Remand',
        },
        {
          value: 'THERAPEUTIC_COMMUNITY',
          text: 'Therapeutic community',
        },
      ])
    })

    it('handles error in setting options gracefully', async () => {
      locationsService.getUsedForTypes.mockRejectedValue(new Error('Some error'))
      await controller.setOptions(req, res, next)
      expect(next).toHaveBeenCalledWith(new Error('Some error'))
    })

    it('calls next', () => {
      controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      controller.setOptions(req, res, jest.fn())

      expect(controller.locals(req, res)).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields: {
          usedFor: {
            component: 'govukCheckboxes',
            errorMessages: {
              required: 'Select what the location is used for',
            },
            hint: { text: 'Select all that apply.' },
            id: 'usedFor',
            items: [
              {
                value: 'REMAND',
                text: 'Remand',
              },
              {
                value: 'THERAPEUTIC_COMMUNITY',
                text: 'Therapeutic community',
              },
            ],
            multiple: true,
            name: 'usedFor',
            validate: ['required'],
            value: [
              {
                text: 'Remand',
                value: 'REMAND',
              },
            ],
          },
        },
        validationErrors: [],
      })
    })

    it('sets the correct backLink and cancelLink in locals', () => {
      const result = controller.locals(req, res)
      expect(result.backLink).toBe('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
      expect(result.cancelLink).toBe('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      req.form.options.fields.usedFor.items = [
        {
          value: 'REMAND',
          text: 'Remand',
        },
      ]
      controller.saveValues(req, res, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateUsedForTypes).toHaveBeenCalledWith(
        'token',
        res.locals.location.id,
        req.form.values.usedFor,
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'change_used_for', { prison_id: 'TST' })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })

  describe('validate', () => {
    it('redirects if usedFor vales match', async () => {
      req.form.values = { usedFor: ['REMAND'] }
      res.locals.location.raw = { usedFor: ['REMAND'] }
      await controller.validate(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })

    it('calls next if usedFor values differ', async () => {
      req.form.values = { usedFor: ['REMAND'] }
      res.locals.location.raw = { usedFor: ['STANDARD_ACCOMMODATION'] }
      await controller.validate(req, res, next)
      expect(next).toHaveBeenCalled()
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

    it('sets flash message correctly', () => {
      expect(req.flash).toHaveBeenCalledWith('success', {
        title: 'Used for changed',
        content: `You have changed what ${res.locals.location.localName} is used for.`,
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith(
        `/view-and-update-locations/${res.locals.location.prisonId}/${res.locals.location.id}`,
      )
    })
  })
})
