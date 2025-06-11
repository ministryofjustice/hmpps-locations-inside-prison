import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ChangeSignedOperationalCapacity from './index'
import fields from '../../routes/changeSignedOperationalCapacity/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'

describe('ChangeSignedOperationalCapacity', () => {
  const controller = new ChangeSignedOperationalCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    deepReq = {
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
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
        systemToken: 'token',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        maxCapacity: '30',
        currentSignedOperationalCapacity: 25,
        options: {
          fields,
        },
        user: {
          username: 'HSLUGHORN',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.updateSignedOperationalCapacity = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('validateFields', () => {
    it('does not allow signed operational capacity to exceed max capacity', () => {
      deepReq.form.values = { newSignedOperationalCapacity: '31', prisonGovernorApproval: 'yes' }

      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

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
      deepReq.form.values = { newSignedOperationalCapacity: '25', prisonGovernorApproval: 'yes' }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST')
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateSignedOperationalCapacity).toHaveBeenCalledWith(
        'token',
        deepRes.locals.prisonId,
        deepReq.form.values.newSignedOperationalCapacity,
        deepRes.locals.user.username,
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_signed_op_cap', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
