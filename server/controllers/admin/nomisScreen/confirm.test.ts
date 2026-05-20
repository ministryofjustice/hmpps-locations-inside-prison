import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import PrisonService from '../../../services/prisonService'
import AnalyticsService from '../../../services/analyticsService'
import NomisScreenStatusChangeConfirm from './confirm'

describe('adminNomisScreenSwitch', () => {
  const controller = new NomisScreenStatusChangeConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      params: { moduleName: 'OIMILOCA' },
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        values: {
          screenStatus: '',
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
          nonResiServiceActive: 'ACTIVE',
          includeSegregationInRollCount: 'INACTIVE',
          certificationApprovalRequired: 'INACTIVE',
        },
        options: {},
        prisonId: 'MDI',
        moduleName: 'OIMILOCA',
        currentScreenStatus: 'ACCESSIBLE',
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    prisonService.addCondition = jest.fn()
    prisonService.removeCondition = jest.fn()
    prisonService.updateScreen = jest.fn()
    prisonService.getScreenStatus = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('saveValues', () => {
    it('addCondition with blockAccess=false when moving from ACCESSIBLE to WARNING', async () => {
      deepReq.form.values.screenStatus = 'WARNING'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.addCondition).toHaveBeenCalledWith('token', 'MDI', false, 'OIMILOCA')
      expect(prisonService.updateScreen).not.toHaveBeenCalled()
      expect(prisonService.removeCondition).not.toHaveBeenCalled()
    })

    it('addCondition with blockAccess=true when moving from ACCESSIBLE to BLOCKED', async () => {
      deepReq.form.values.screenStatus = 'BLOCKED'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.addCondition).toHaveBeenCalledWith('token', 'MDI', true, 'OIMILOCA')
    })

    it('updateScreen with block=true when moving from WARNING to BLOCKED', async () => {
      deepRes.locals.currentScreenStatus = 'WARNING'
      deepReq.form.values.screenStatus = 'BLOCKED'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.updateScreen).toHaveBeenCalledWith('token', 'MDI', true, 'OIMILOCA')
      expect(prisonService.addCondition).not.toHaveBeenCalled()
    })

    it('updateScreen with block=false when moving from BLOCKED to WARNING', async () => {
      deepRes.locals.currentScreenStatus = 'BLOCKED'
      deepReq.form.values.screenStatus = 'WARNING'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.updateScreen).toHaveBeenCalledWith('token', 'MDI', false, 'OIMILOCA')
    })

    it('removeCondition when moving from BLOCKED to ACCESSIBLE', async () => {
      deepRes.locals.currentScreenStatus = 'BLOCKED'
      deepReq.form.values.screenStatus = 'ACCESSIBLE'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.removeCondition).toHaveBeenCalledWith('token', 'MDI', 'OIMILOCA')
      expect(prisonService.updateScreen).not.toHaveBeenCalled()
    })

    it('no-op when moving from ACCESSIBLE to ACCESSIBLE', async () => {
      deepReq.form.values.screenStatus = 'ACCESSIBLE'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.removeCondition).not.toHaveBeenCalled()
      expect(prisonService.updateScreen).not.toHaveBeenCalled()
      expect(prisonService.addCondition).not.toHaveBeenCalled()
    })

    it('passes moduleName through to API calls for OIMULOCA', async () => {
      deepRes.locals.moduleName = 'OIMULOCA'
      deepRes.locals.currentScreenStatus = 'ACCESSIBLE'
      deepReq.form.values.screenStatus = 'BLOCKED'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(prisonService.addCondition).toHaveBeenCalledWith('token', 'MDI', true, 'OIMULOCA')
    })

    it('sends an analytics event', async () => {
      deepReq.form.values.screenStatus = 'BLOCKED'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'nomis_screen_status', {
        prison_id: 'MDI',
        module_name: 'OIMILOCA',
        status: 'BLOCKED',
      })
    })

    it('calls next on success', async () => {
      deepReq.form.values.screenStatus = 'BLOCKED'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('forwards errors to next', async () => {
      const boom = new Error('boom') as SanitisedError<object>
      ;(prisonService.addCondition as jest.Mock).mockImplementation(() => {
        throw boom
      })
      deepReq.form.values.screenStatus = 'BLOCKED'
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(boom)
    })
  })

  describe('loadCurrentStatus', () => {
    it('returns ACCESSIBLE when getScreenStatus throws 404', async () => {
      const notFound = new Error('Not Found') as SanitisedError<object>
      notFound.responseStatus = 404
      ;(prisonService.getScreenStatus as jest.Mock).mockImplementation(() => Promise.reject(notFound))

      await controller.loadCurrentStatus(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.currentScreenStatus).toBe('ACCESSIBLE')
      expect(deepRes.locals.moduleName).toBe('OIMILOCA')
      expect(next).toHaveBeenCalledWith()
    })

    it('returns BLOCKED when condition exists with blockAccess=true', async () => {
      ;(prisonService.getScreenStatus as jest.Mock).mockResolvedValue({
        conditionType: 'CASELOAD',
        conditionValue: 'MDI',
        blockAccess: true,
      })

      await controller.loadCurrentStatus(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.currentScreenStatus).toBe('BLOCKED')
    })

    it('returns WARNING when condition exists with blockAccess=false', async () => {
      ;(prisonService.getScreenStatus as jest.Mock).mockResolvedValue({
        conditionType: 'CASELOAD',
        conditionValue: 'MDI',
        blockAccess: false,
      })

      await controller.loadCurrentStatus(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.currentScreenStatus).toBe('WARNING')
    })

    it('forwards non-404 errors to next', async () => {
      const boom = new Error('boom') as SanitisedError<object>
      boom.responseStatus = 500
      ;(prisonService.getScreenStatus as jest.Mock).mockImplementation(() => Promise.reject(boom))

      await controller.loadCurrentStatus(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(boom)
    })

    it('forwards an error for unsupported moduleName', async () => {
      deepReq.params.moduleName = 'OIMMHOLO'

      await controller.loadCurrentStatus(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
