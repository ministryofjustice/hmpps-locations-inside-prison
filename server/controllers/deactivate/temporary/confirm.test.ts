import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/deactivate/fields'
import DeactivateTemporaryConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AnalyticsService from '../../../services/analyticsService'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('DeactivateTemporaryConfirm', () => {
  const controller = new DeactivateTemporaryConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  let formValues: {
    deactivationReason: string
    estimatedReactivationDate: string
    planetFmReference: string
    deactivationReasonDescription: string
    deactivationReasonOther: string
  }

  beforeEach(() => {
    formValues = {
      deactivationReason: 'OTHER',
      deactivationReasonDescription: 'Description',
      deactivationReasonOther: 'Other',
      estimatedReactivationDate: '2030-04-20',
      planetFmReference: 'PFMRN123',
    }
    deepReq = {
      form: {
        options: {
          fields,
        },
        values: formValues,
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
          (fieldName?: keyof typeof formValues) => formValues[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
          locationType: 'CELL',
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
        values: formValues,
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.deactivateTemporary = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('generateChangeSummary', () => {
    it('returns the expected string', () => {
      expect(controller.generateChangeSummary(1, 2, 1020)).toEqual(`You are making 1 cell inactive.
<br/><br/>
This will reduce the establishment's total working capacity from 1020 to 1018.`)

      expect(controller.generateChangeSummary(42, 40, 1020)).toEqual(`You are making 42 cells inactive.
<br/><br/>
This will reduce the establishment's total working capacity from 1020 to 980.`)
    })
  })

  describe('_locals', () => {
    beforeEach(() => {
      deepReq.services = {
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      }
    })

    it('sets the correct local for REASON', async () => {
      deepReq.form.values = {
        deactivationReason: 'REASON',
        deactivationReasonDescription: 'Description text',
      }
      ;(deepReq.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Translated reason')

      const callback = jest.fn()
      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepRes.locals.deactivationReason).toEqual('Translated reason - Description text')
    })

    it('sets the correct local for OTHER', async () => {
      deepReq.form.values = {
        deactivationReason: 'OTHER',
        deactivationReasonOther: 'Other description text',
      }
      ;(deepReq.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue(
        'Other translated reason',
      )

      const callback = jest.fn()
      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepRes.locals.deactivationReason).toEqual('Other translated reason - Other description text')
    })

    it('sets the correct local for REASON without description', async () => {
      deepReq.form.values = {
        deactivationReason: 'REASON',
        deactivationReasonDescription: '',
      }
      ;(deepReq.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Translated reason')

      const callback = jest.fn()
      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepRes.locals.deactivationReason).toEqual('Translated reason')
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.deactivateTemporary).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'OTHER',
        'Other',
        '2030-04-20',
        'PFMRN123',
      )
    })

    describe('when cell is occupied error occurs', () => {
      beforeEach(async () => {
        const error: any = new Error('API error: Cell is occupied')
        error.data = { errorCode: 109 }
        locationsService.deactivateTemporary.mockRejectedValue(error)

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
      locationsService.deactivateTemporary.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'deactivate_temp', {
        prison_id: 'TST',
        location_type: 'Cell',
        deactivation_reason: 'OTHER',
      })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
