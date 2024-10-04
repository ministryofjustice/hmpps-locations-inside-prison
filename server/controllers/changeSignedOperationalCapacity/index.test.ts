import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeSignedOperationalCapacity from './index'
import fields from '../../routes/changeSignedOperationalCapacity/fields'
import LocationsService from '../../services/locationsService'
import AuthService from '../../services/authService'
import AnalyticsService from '../../services/analyticsService'

describe('ChangeSignedOperationalCapacity', () => {
  const controller = new ChangeSignedOperationalCapacity({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    req = {
      form: {
        options: {
          fields,
        },
        values: {
          newSignedOperationalCapacity: 14,
          prisonGovernorApproval: true,
        },
      },
      services: {
        analyticsService,
        authService,
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn((fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        maxCapacity: 30,
        currentSignedOperationalCapacity: 25,
        options: {
          fields,
        },
        user: {
          username: 'HSLUGHORN',
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.updateSignedOperationalCapacity = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('validateFields', () => {
    it('does not allow signed operational capacity to exceed max capacity', () => {
      req.form.values = { newSignedOperationalCapacity: '31', prisonGovernorApproval: 'yes' }

      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(callback).toHaveBeenCalledWith({
        newSignedOperationalCapacity: {
          args: {},
          key: 'newSignedOperationalCapacity',
          type: 'doesNotExceedEstMaxCap',
        },
      })
    })
  })

  describe('validate', () => {
    it('redirects to the show location page when there are no changes', () => {
      req.form.values = { newSignedOperationalCapacity: '25', prisonGovernorApproval: 'yes' }
      res.redirect = jest.fn()
      controller.validate(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST')
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(req, res, next)

      expect(locationsService.updateSignedOperationalCapacity).toHaveBeenCalledWith(
        'token',
        res.locals.prisonId,
        req.form.values.newSignedOperationalCapacity,
        res.locals.user.username,
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'change_signed_op_cap', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
