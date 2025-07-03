import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import PrisonService from '../../../services/prisonService'
import AnalyticsService from '../../../services/analyticsService'
import NonHousingCheckboxChangeConfirm from './confirm'

describe('adminCertificationSwitch', () => {
  const controller = new NonHousingCheckboxChangeConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>
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
          disableNonHousingCheckboxes: '',
        },
      },
      services: {
        analyticsService,
        prisonService,
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

    prisonService.activatePrisonService = jest.fn()
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
      deepReq.form.values.disableNonHousingCheckboxes = 'true'
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(prisonService.activatePrisonService).toHaveBeenCalledWith('token', 'MDI', 'DISPLAY_HOUSING_CHECKBOX')
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'disable_non_housing_checkboxes', {
        prison_id: 'MDI',
        disableCheckboxes: true,
      })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
