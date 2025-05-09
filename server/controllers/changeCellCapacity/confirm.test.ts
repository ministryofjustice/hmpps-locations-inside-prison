import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ConfirmCellCapacity from './confirm'
import LocationsService from '../../services/locationsService'
import AuthService from '../../services/authService'
import AnalyticsService from '../../services/analyticsService'

describe('ConfirmCellCapacity', () => {
  const controller = new ConfirmCellCapacity({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  let permissions: { [permission: string]: boolean }
  let sessionModel: { [key: string]: unknown }

  beforeEach(() => {
    permissions = {}
    sessionModel = { maxCapacity: '3', workingCapacity: '1' }
    req = {
      canAccess: (permission: string) => permissions[permission],
      form: {
        values: {
          maxCapacity: '3',
          workingCapacity: '1',
        },
      },
      services: {
        analyticsService,
        authService,
        locationsService,
      },
      session: {
        referrerUrl: '/',
      },
      sessionModel: {
        get: jest.fn((fieldName?: string) => sessionModel[fieldName]),
        set: jest.fn((fieldName?: string, value?: unknown) => {
          sessionModel[fieldName] = value
        }),
      },
    } as unknown as typeof req
    res = {
      locals: {
        values: {
          maxCapacity: 2,
          workingCapacity: 2,
        },
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
          prisonId: 'TST',
        },
        residentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        user: {
          username: 'HSLUGHORN',
        },
      },
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.updateCapacity = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    describe('when the user has permission to change_max_capacity', () => {
      beforeEach(() => {
        permissions.change_max_capacity = true
      })

      it('formats the change summary correctly', () => {
        const result = controller.locals(req, res)
        expect(result).toEqual({
          backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/change',
          cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          changeSummary: `You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s working capacity from 20 to 19.
<br/><br/>
You are increasing the cell’s maximum capacity by 1.
<br/><br/>
This will increase the establishment’s maximum capacity from 30 to 31.`,
        })
      })
    })

    describe('when the user does not have permission to change_max_capacity', () => {
      beforeEach(() => {
        permissions.change_max_capacity = false
      })

      it('strips the max capacity from the change summary', () => {
        const result = controller.locals(req, res)
        expect(result).toEqual({
          backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/change',
          cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          changeSummary: `You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s working capacity from 20 to 19.`,
        })
      })
    })
  })

  describe('saveValues', () => {
    describe('when the user has permission to change_max_capacity', () => {
      beforeEach(() => {
        permissions.change_max_capacity = true
      })
      it('calls locationsService', async () => {
        await controller.saveValues(req, res, next)

        expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', res.locals.location.id, 3, 1)
      })
    })

    describe('when the user does not have permission to change_max_capacity', () => {
      beforeEach(() => {
        permissions.change_max_capacity = false
      })
      it('calls locationsService without the max capacity change', async () => {
        await controller.saveValues(req, res, next)

        expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', res.locals.location.id, 2, 1)
      })
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'change_cell_capacity', { prison_id: 'TST' })
    })

    it('calls next', async () => {
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
