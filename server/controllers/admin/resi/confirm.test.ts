import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import ResiStatusChangeConfirm from './confirm'
import PrisonService from '../../../services/prisonService'

describe('adminResiSwitch', () => {
  const controller = new ResiStatusChangeConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
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
          activation: '',
        },
      },
      services: {
        analyticsService,
        locationsService,
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

    locationsService.updateResiStatus = jest.fn()
    prisonService.activatePrisonService = jest.fn()
    prisonService.deactivatePrisonService = jest.fn()
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

  describe('saveValues for activiating RESI', () => {
    beforeEach(() => {
      deepReq.form.values.activation = 'ACTIVE'
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateResiStatus).toHaveBeenCalledWith('token', 'MDI', 'ACTIVE')
      expect(prisonService.activatePrisonService).toHaveBeenCalledWith('token', 'MDI', 'DISPLAY_HOUSING_CHECKBOX')
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'resi_status', {
        prison_id: 'MDI',
        status: 'ACTIVE',
      })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })

  describe('saveValues for de-activiating RESI', () => {
    beforeEach(() => {
      deepReq.form.values.activation = 'INACTIVE'
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateResiStatus).toHaveBeenCalledWith('token', 'MDI', 'INACTIVE')
      expect(prisonService.deactivatePrisonService).toHaveBeenCalledWith('token', 'MDI', 'DISPLAY_HOUSING_CHECKBOX')
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'resi_status', {
        prison_id: 'MDI',
        status: 'INACTIVE',
      })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
