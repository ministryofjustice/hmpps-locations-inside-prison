import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/deactivate/fields'
import ReactivateCellConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('ReactivateCellConfirm', () => {
  const controller = new ReactivateCellConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  let sessionModel: { [key: string]: any }

  beforeEach(() => {
    sessionModel = {
      maxCapacity: 2,
      workingCapacity: 1,
    }
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: sessionModel,
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
        set: jest.fn(),
        get: jest.fn((fieldName?: string) => sessionModel[fieldName]),
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }
    deepRes = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: '7e570000-0000-0000-0000-000000000001',
          locationType: 'CELL',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        }),
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
        values: sessionModel,
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.reactivateCell = jest.fn()
    analyticsService.sendEvent = jest.fn()
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
      deepReq.services = {
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      }
    })

    it('sets the correct locals', async () => {
      getReferrerRootUrl(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      deepReq.form.values = {
        deactivationReason: 'REASON',
        deactivationReasonDescription: 'Description text',
      }
      ;(deepReq.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Translated reason')

      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: `/reactivate/cell/${deepRes.locals.decoratedLocation.id}/details`,
        cancelLink: `/view-and-update-locations/${deepRes.locals.decoratedLocation.prisonId}/${deepRes.locals.decoratedLocation.id}`,
        changeSummary: `The establishment's total working capacity will increase from 20 to 21.\n<br/><br/>\nThe establishment's total maximum capacity will increase from 30 to 31.`,
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.reactivateCell).toHaveBeenCalledWith(
        'token',
        deepRes.locals.decoratedLocation.id,
        sessionModel,
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'reactivate_cell', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('resets the journey model', () => {
      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Cell activated',
        content: 'You have activated cell A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })

    describe('when the referrer is parent', () => {
      beforeEach(() => {
        sessionModel.referrerFlow = 'parent'
        sessionModel.referrerPrisonId = 'ABC'
        sessionModel.referrerLocationId = '7e570000-0000-1000-8000-000000000001'
      })

      it('redirects to the parent view location page', () => {
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/view-and-update-locations/ABC/7e570000-0000-1000-8000-000000000001',
        )
      })
    })

    describe('when the referrer is inactive-cells', () => {
      beforeEach(() => {
        sessionModel.referrerFlow = 'inactive-cells'
        sessionModel.referrerPrisonId = 'ABC'
      })

      it('redirects to the prison inactive cells page', () => {
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.redirect).toHaveBeenCalledWith('/inactive-cells/ABC')
      })

      describe('when a referrerLocationId is set', () => {
        beforeEach(() => {
          sessionModel.referrerLocationId = '7e570000-0000-1000-8000-000000000001'
        })

        it('redirects to the locations inactive cells page', () => {
          controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

          expect(deepRes.redirect).toHaveBeenCalledWith('/inactive-cells/ABC/7e570000-0000-1000-8000-000000000001')
        })
      })
    })
  })
})
