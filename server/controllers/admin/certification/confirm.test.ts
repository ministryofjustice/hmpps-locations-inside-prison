import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import CertApprovalStatusChangeConfirm from './confirm'

describe('adminCertificationSwitch', () => {
  const controller = new CertApprovalStatusChangeConfirm({ route: '/' })
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
      form: {
        values: {
          activation: '',
        },
      },
      services: {
        analyticsService,
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn() as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        prisonConfiguration: {
          prisonId: 'MDI',
          resiLocationServiceActive: 'ACTIVE',
          includeSegregationInRollCount: 'INACTIVE',
          certificationApprovalRequired: 'INACTIVE',
        },
        options: {},
        prisonId: 'MDI',
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.updateCertificationApproval = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/admin/MDI',
        cancelLink: '/admin/MDI',
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.values.activation = 'INACTIVE'
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateCertificationApproval).toHaveBeenCalledWith('token', 'MDI', 'INACTIVE')
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'certification_status', {
        prison_id: 'MDI',
        status: 'INACTIVE',
      })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
