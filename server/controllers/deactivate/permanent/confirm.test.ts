import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/deactivate/fields'
import DeactivatePermanentConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('DeactivatePermanentConfirm', () => {
  const controller = new DeactivatePermanentConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          permanentDeactivationReason: 'wing has vanished',
        },
      },
      journeyModel: {
        reset: jest.fn(),
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
        get: jest.fn(_ => deepReq.form.values.permanentDeactivationReason) as FormWizard.Request['sessionModel']['get'],
        reset: jest.fn(),
      },
    }
    deepRes = {
      locals: {
        cellCount: 1,
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          locationType: 'CELL',
          localName: undefined,
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
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
        user: {
          username: 'LLOVEGOOD',
        },
        values: {
          permanentDeactivationReason: 'wing has vanished',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.deactivatePermanent = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('formats the change summary correctly', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual({
        buttonText: 'Confirm deactivation',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are archiving 1 cell.
<br/><br/>
The establishment’s working capacity will reduce from 20 to 19.
<br/><br/>
The establishment’s maximum capacity will reduce from 30 to 28.`,
        deactivationReason: 'wing has vanished',
        title: 'You are permanently deactivating this location',
        titleCaption: 'Cell A-1-001',
      })
    })

    it('formats the change summary correctly with zero working cap', () => {
      deepRes.locals.decoratedLocation.capacity.workingCapacity = 0
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        buttonText: 'Confirm deactivation',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are archiving 1 cell.
<br/><br/>
The establishment’s maximum capacity will reduce from 30 to 28.`,
        deactivationReason: 'wing has vanished',
        title: 'You are permanently deactivating this location',
        titleCaption: 'Cell A-1-001',
      })
    })

    it('formats the change summary correctly with multiple cells', () => {
      deepRes.locals.cellCount = 10
      deepRes.locals.decoratedLocation.capacity = {
        maxCapacity: 15,
        workingCapacity: 10,
      }
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        buttonText: 'Confirm deactivation',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are archiving 10 cells.
<br/><br/>
The establishment’s working capacity will reduce from 20 to 10.
<br/><br/>
The establishment’s maximum capacity will reduce from 30 to 15.`,
        deactivationReason: 'wing has vanished',
        title: 'You are permanently deactivating this location',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.deactivatePermanent).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'wing has vanished',
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'deactivate_perm', {
        prison_id: 'TST',
        location_type: 'Cell',
      })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })

    describe('when cell is occupied error occurs', () => {
      beforeEach(async () => {
        const error: any = new Error('API error: Cell is occupied')
        error.data = { errorCode: 109 }
        locationsService.deactivatePermanent.mockRejectedValue(error)

        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      })

      it('redirects to the cell occupied page', () => {
        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/deactivate/occupied',
        )
      })

      it('sends a handled_error event to Google Analytics', () => {
        expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'handled_error', {
          prison_id: 'TST',
          error_code: 109,
        })
      })
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      locationsService.deactivatePermanent.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
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
        title: 'Location archived',
        content: 'You have permanently deactivated cell A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith('/archived-locations/TST')
    })
  })
})
