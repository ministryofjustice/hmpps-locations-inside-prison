import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import NonResiStatusChangeConfirm from './confirm'

describe('adminNonResiSwitch', () => {
  const controller = new NonResiStatusChangeConfirm({ route: '/' })
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
          nonResiServiceActive: 'ACTIVE',
          includeSegregationInRollCount: 'INACTIVE',
          certificationApprovalRequired: 'INACTIVE',
        },
        options: {},
        prisonId: 'MDI',
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.updateNonResiStatus = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/admin/MDI',
        buttonText: 'Inactivate non-residential locations',
        cancelLink: '/admin/MDI',
        cancelText: 'Cancel and return to prison configuration details',
        title: 'Update non-residential locations status',
      })
    })
  })

  describe('saveValues for activating NON-RESI', () => {
    beforeEach(() => {
      deepReq.form.values.activation = 'ACTIVE'
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateNonResiStatus).toHaveBeenCalledWith('token', 'MDI', 'ACTIVE')
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'non_resi_status', {
        prison_id: 'MDI',
        status: 'ACTIVE',
      })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })

  describe('saveValues for de-activating NON-RESI', () => {
    beforeEach(() => {
      deepReq.form.values.activation = 'INACTIVE'
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateNonResiStatus).toHaveBeenCalledWith('token', 'MDI', 'INACTIVE')
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'non_resi_status', {
        prison_id: 'MDI',
        status: 'INACTIVE',
      })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
