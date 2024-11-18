import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivate/fields'
import { Services } from '../../../services'
import ReactivateCellConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AuthService from '../../../services/authService'
import AnalyticsService from '../../../services/analyticsService'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'

describe('ReactivateCellConfirm', () => {
  const controller = new ReactivateCellConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  let sessionModel: { [key: string]: any }

  beforeEach(() => {
    sessionModel = {
      maxCapacity: 2,
      workingCapacity: 1,
    }
    req = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: sessionModel,
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
        set: jest.fn(),
        get: jest.fn((fieldName?: string) => sessionModel[fieldName]),
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
    } as unknown as typeof req
    res = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        location: {
          displayName: 'A-1-001',
          id: '7e570000-0000-0000-0000-000000000001',
          locationType: 'Cell',
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
        values: sessionModel,
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
      getReferrerRootUrl(req, res, jest.fn())

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

      expect(locationsService.reactivateCell).toHaveBeenCalledWith('token', res.locals.location.id, sessionModel)
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

  describe('successHandler', () => {
    beforeEach(() => {
      controller.successHandler(req, res, next)
    })

    it('resets the journey model', () => {
      expect(req.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(req.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(req.flash).toHaveBeenCalledWith('success', {
        title: 'Cell activated',
        content: 'You have activated A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001')
    })

    describe('when the referrer is parent', () => {
      beforeEach(() => {
        sessionModel.referrerFlow = 'parent'
        sessionModel.referrerPrisonId = 'ABC'
        sessionModel.referrerLocationId = '7e570000-0000-1000-8000-000000000001'
      })

      it('redirects to the parent view location page', () => {
        controller.successHandler(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/ABC/7e570000-0000-1000-8000-000000000001')
      })
    })

    describe('when the referrer is inactive-cells', () => {
      beforeEach(() => {
        sessionModel.referrerFlow = 'inactive-cells'
        sessionModel.referrerPrisonId = 'ABC'
      })

      it('redirects to the prison inactive cells page', () => {
        controller.successHandler(req, res, next)

        expect(res.redirect).toHaveBeenCalledWith('/inactive-cells/ABC')
      })

      describe('when a referrerLocationId is set', () => {
        beforeEach(() => {
          sessionModel.referrerLocationId = '7e570000-0000-1000-8000-000000000001'
        })

        it('redirects to the locations inactive cells page', () => {
          controller.successHandler(req, res, next)

          expect(res.redirect).toHaveBeenCalledWith('/inactive-cells/ABC/7e570000-0000-1000-8000-000000000001')
        })
      })
    })
  })
})
