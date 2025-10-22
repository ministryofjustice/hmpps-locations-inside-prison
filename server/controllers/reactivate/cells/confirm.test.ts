import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/deactivate/fields'
import ReactivateCellsConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import LocationFactory from '../../../testutils/factories/location'

describe('ReactivateCellsConfirm', () => {
  const controller = new ReactivateCellsConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
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
    deepReq = {
      form: {
        options: {
          fields,
        },
        values: sessionModelValues,
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
          (fieldName?: keyof typeof sessionModelValues) => sessionModelValues[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        user: {
          activeCaseload: {
            id: 'TST',
            name: 'Test Prison',
          },
          username: 'username',
        },
        errorlist: [],
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        }),
        cells: [
          LocationFactory.build({
            id: 'l1',
            oldWorkingCapacity: 2,
            capacity: {
              maxCapacity: 3,
            },
          }),
          LocationFactory.build({
            id: 'l2',
            oldWorkingCapacity: 1,
            capacity: {
              maxCapacity: 2,
            },
          }),
        ],
        options: {
          fields,
        },
        prisonerLocation: {
          prisoners: [],
        },
        prisonResidentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        values: sessionModelValues,
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.reactivateBulk = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('getResidentialSummary', () => {
    it('calls the correct locations service call', async () => {
      deepReq.services = {
        locationsService: {
          getResidentialSummary: jest.fn(),
        },
      }
      const callback = jest.fn()
      await controller.getPrisonResidentialSummary(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepReq.services.locationsService.getResidentialSummary).toHaveBeenCalledWith(
        'token',
        deepRes.locals.location.prisonId,
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
      deepReq.services = {
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      }
    })

    it('sets the correct locals', async () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        buttonText: 'Confirm activation',
        cancelLink: `/inactive-cells/${sessionModelValues.referrerPrisonId}/${sessionModelValues.referrerLocationId}`,
        cancelText: 'Cancel',
        changeSummary: 'The establishment’s total working capacity will increase from 20 to 23.',
        title: 'You are about to reactivate 2 cells',
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.reactivateBulk).toHaveBeenCalledWith('token', {
        l1: { capacity: { maxCapacity: 3, workingCapacity: 2 } },
        l2: { capacity: { maxCapacity: 2, workingCapacity: 1 } },
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'reactivate_cells', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
