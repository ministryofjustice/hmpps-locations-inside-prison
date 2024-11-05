import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivate/fields'
import DeactivatePermanentConfirm from './confirm'
import LocationsService from '../../../services/locationsService'
import AuthService from '../../../services/authService'
import AnalyticsService from '../../../services/analyticsService'

describe('DeactivatePermanentConfirm', () => {
  const controller = new DeactivatePermanentConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    req = {
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
        authService,
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn(_ => req.form.values.permanentDeactivationReason),
        reset: jest.fn(),
      },
    } as unknown as FormWizard.Request
    res = {
      locals: {
        cellCount: 1,
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          locationType: 'CELL',
          displayName: 'A-1-001',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
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
        user: {
          username: 'LLOVEGOOD',
        },
        values: {
          permanentDeactivationReason: 'wing has vanished',
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.deactivatePermanent = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('formats the change summary correctly', () => {
      const result = controller.locals(req, res)
      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are archiving 1 cell.
<br/><br/>
The establishment’s working capacity will reduce from 20 to 19.
<br/><br/>
The establishment’s maximum capacity will reduce from 30 to 28.`,
        permanentDeactivationReason: 'wing has vanished',
      })
    })

    it('formats the change summary correctly with zero working cap', () => {
      res.locals.location.capacity.workingCapacity = 0
      const result = controller.locals(req, res)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are archiving 1 cell.
<br/><br/>
The establishment’s maximum capacity will reduce from 30 to 28.`,
        permanentDeactivationReason: 'wing has vanished',
      })
    })

    it('formats the change summary correctly with multiple cells', () => {
      res.locals.cellCount = 10
      res.locals.location.capacity = {
        maxCapacity: 15,
        workingCapacity: 10,
      }
      const result = controller.locals(req, res)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are archiving 10 cells.
<br/><br/>
The establishment’s working capacity will reduce from 20 to 10.
<br/><br/>
The establishment’s maximum capacity will reduce from 30 to 15.`,
        permanentDeactivationReason: 'wing has vanished',
      })
    })
  })

  describe('saveValues', () => {
    it('calls locationsService', async () => {
      await controller.saveValues(req, res, next)

      expect(locationsService.deactivatePermanent).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'wing has vanished',
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'deactivate_perm', {
        prison_id: 'TST',
        location_type: 'CELL',
      })
    })

    it('calls next', async () => {
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('redirects to the cell occupied page when cell is occupied error occurs', async () => {
      const error: any = new Error('API error: Cell is occupied')
      error.data = { errorCode: 109 }
      locationsService.deactivatePermanent.mockRejectedValue(error)
      await controller.saveValues(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/deactivate/occupied')
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      locationsService.deactivatePermanent.mockRejectedValue(error)
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
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
        title: 'Location archived',
        content: 'You have permanently deactivated A-1-001.',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/archived-locations/TST')
    })
  })
})
