import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivateTemporary/fields'
import { Services } from '../../../services'
import ReactivateCellConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AuthService from '../../../services/authService'
import AnalyticsService from '../../../services/analyticsService'

describe('ReactivateCellConfirm', () => {
  const controller = new ReactivateCellConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  let formValues: {
    maxCapacity: number
    workingCapacity: number
  }

  beforeEach(() => {
    formValues = {
      maxCapacity: 2,
      workingCapacity: 1,
    }
    req = {
      form: {
        options: {
          fields,
        },
        values: formValues,
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
        get: jest.fn((fieldName?: keyof typeof formValues) => formValues[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        },
        options: {
          fields,
        },
        prisonerLocation: {
          prisoners: [],
        },
        residentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        values: formValues,
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.reactivateCell = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('getResidentialSummary', () => {
    it('calls the correct locations service call', async () => {
      req.services = {
        authService: {
          getSystemClientToken: () => 'token',
        },
        locationsService: {
          getResidentialSummary: jest.fn(),
        },
      } as unknown as Services
      const callback = jest.fn()
      await controller.getResidentialSummary(req, res, callback)

      expect(req.services.locationsService.getResidentialSummary).toHaveBeenCalledWith(
        'token',
        res.locals.location.prisonId,
      )
    })
  })

  describe('generateChangeSummary', () => {
    it('returns the expected string', () => {
      expect(controller.generateChangeSummary('TEST_NAME', 0, 2, 40)).toEqual(
        `The establishment's total TEST_NAME will increase from 40 to 42.`,
      )
      expect(controller.generateChangeSummary('TEST_NAME', 2, 0, 42)).toEqual(
        `The establishment's total TEST_NAME will decrease from 42 to 40.`,
      )
    })
  })

  describe('locals', () => {
    beforeEach(() => {
      req.services = {
        authService: {
          getSystemClientToken: () => 'token',
        },
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      } as unknown as Services
    })

    it('sets the correct locals', async () => {
      req.form.values = {
        deactivationReason: 'REASON',
        deactivationReasonDescription: 'Description text',
      }
      ;(req.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Translated reason')

      expect(controller.locals(req, res)).toEqual({
        backLink: `/reactivate/cell/${res.locals.location.id}/details`,
        cancelLink: `/view-and-update-locations/${res.locals.location.prisonId}/${res.locals.location.id}`,
        changeSummary: `The establishment's total working capacity will increase from 20 to 21.\n<br/><br/>\nThe establishment's total maximum capacity will increase from 30 to 31.`,
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(req, res, next)

      expect(locationsService.reactivateCell).toHaveBeenCalledWith('token', res.locals.location.id, formValues)
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'reactivate_cell', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
