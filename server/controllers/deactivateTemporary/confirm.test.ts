import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../routes/deactivateTemporary/fields'
import { Services } from '../../services'
import DeactivateTemporaryConfirm from './confirm'
import LocationsService from '../../services/locationsService'
import AuthService from '../../services/authService'
import AnalyticsService from '../../services/analyticsService'

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

  describe('getCellCount', () => {
    beforeEach(() => {
      req.services = {
        authService: {
          getSystemClientToken: jest.fn().mockResolvedValue('token'),
        },
        locationsService: {
          getResidentialSummary: jest
            .fn()
            .mockResolvedValue({ parentLocation: { numberOfCellLocations: 10, inactiveCells: 2 } }),
        },
      } as unknown as Services
    })

    describe('when location is a CELL', () => {
      beforeEach(() => {
        res.locals.location.raw = { ...res.locals.location, locationType: 'CELL' }
      })

      it('sets cellCount to 1 without calling the API', async () => {
        const callback = jest.fn()
        await controller.getCellCount(req, res, callback)

        expect(res.locals.cellCount).toBe(1)
        expect(req.services.authService.getSystemClientToken).not.toHaveBeenCalled()
        expect(req.services.locationsService.getResidentialSummary).not.toHaveBeenCalled()
      })
    })

    describe('when location is not a CELL', () => {
      beforeEach(() => {
        res.locals.location.raw = { ...res.locals.location, locationType: 'LANDING' }
      })

      it('calls the API to get cell count', async () => {
        const callback = jest.fn()
        await controller.getCellCount(req, res, callback)

        expect(res.locals.cellCount).toBe(8)
      })
    })
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
