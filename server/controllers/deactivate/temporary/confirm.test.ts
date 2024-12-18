import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivate/fields'
import { Services } from '../../../services'
import DeactivateTemporaryConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AuthService from '../../../services/authService'
import AnalyticsService from '../../../services/analyticsService'

describe('DeactivateTemporaryConfirm', () => {
  const controller = new DeactivateTemporaryConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
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
            maxCapacity: 2,
            workingCapacity: 2,
          },
          locationType: 'CELL',
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
      req.services = {
        authService: {
          getSystemClientToken: () => 'token',
        },
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      } as unknown as Services
    })

    it('sets the correct local for REASON', async () => {
      req.form.values = {
        deactivationReason: 'REASON',
        deactivationReasonDescription: 'Description text',
      }
      ;(req.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Translated reason')

      const callback = jest.fn()
      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(req, res, callback)

      expect(res.locals.deactivationReason).toEqual('Translated reason - Description text')
    })

    it('sets the correct local for OTHER', async () => {
      req.form.values = {
        deactivationReason: 'OTHER',
        deactivationReasonOther: 'Other description text',
      }
      ;(req.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Other translated reason')

      const callback = jest.fn()
      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(req, res, callback)

      expect(res.locals.deactivationReason).toEqual('Other translated reason - Other description text')
    })

    it('sets the correct local for REASON without description', async () => {
      req.form.values = {
        deactivationReason: 'REASON',
        deactivationReasonDescription: '',
      }
      ;(req.services.locationsService.getDeactivatedReason as jest.Mock).mockResolvedValue('Translated reason')

      const callback = jest.fn()
      // eslint-disable-next-line no-underscore-dangle
      await controller._locals(req, res, callback)

      expect(res.locals.deactivationReason).toEqual('Translated reason')
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(req, res, next)

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

        await controller.saveValues(req, res, next)
      })

      it('redirects to the cell occupied page', () => {
        expect(res.redirect).toHaveBeenCalledWith('/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/deactivate/occupied')
      })

      it('sends a handled_error event to Google Analytics', () => {
        expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'handled_error', {
          prison_id: 'TST',
          error_code: 109,
        })
      })
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      locationsService.deactivateTemporary.mockRejectedValue(error)
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'deactivate_temp', {
        prison_id: 'TST',
        location_type: 'CELL',
        deactivation_reason: 'OTHER',
      })
    })

    it('calls next', async () => {
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
