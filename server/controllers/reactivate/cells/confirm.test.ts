import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivate/fields'
import { Services } from '../../../services'
import ReactivateCellsConfirm from './confirm'
import AuthService from '../../../services/authService'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'

describe('ReactivateCellsConfirm', () => {
  const controller = new ReactivateCellsConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  let sessionModelValues: {
    referrerPrisonId: string
    referrerLocationId: string
    selectedLocations: string[]
  }

  beforeEach(() => {
    sessionModelValues = {
      referrerPrisonId: 'TST',
      referrerLocationId: 'l0',
      selectedLocations: ['l1', 'l2'],
    }
    req = {
      form: {
        options: {
          fields,
        },
        values: sessionModelValues,
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
        get: jest.fn((fieldName?: keyof typeof sessionModelValues) => sessionModelValues[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        user: {
          activeCaseload: {
            id: 'TST',
            name: 'Test Prison',
          },
          username: 'username',
        },
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        },
        cells: [
          {
            id: 'l1',
            oldWorkingCapacity: 2,
            capacity: {
              maxCapacity: 3,
            },
          },
          {
            id: 'l2',
            oldWorkingCapacity: 1,
            capacity: {
              maxCapacity: 2,
            },
          },
        ],
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
        values: sessionModelValues,
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.reactivateBulk = jest.fn()
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
      expect(controller.generateChangeSummary('TEST_NAME', 0, 2)).toEqual(
        `The establishment’s total TEST_NAME capacity will increase from 0 to 2.`,
      )
      expect(controller.generateChangeSummary('TEST_NAME', 2, 0)).toEqual(
        `The establishment’s total TEST_NAME capacity will decrease from 2 to 0.`,
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
      expect(controller.locals(req, res)).toEqual({
        backLink: `/reactivate/cells/check-capacity`,
        cancelLink: `/inactive-cells/${sessionModelValues.referrerPrisonId}/${sessionModelValues.referrerLocationId}`,
        changeSummary: `The establishment’s total working capacity will increase from 20 to 23.`,
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(req, res, next)

      expect(locationsService.reactivateBulk).toHaveBeenCalledWith('token', {
        l1: { capacity: { maxCapacity: 3, workingCapacity: 2 } },
        l2: { capacity: { maxCapacity: 2, workingCapacity: 1 } },
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'reactivate_cells', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
