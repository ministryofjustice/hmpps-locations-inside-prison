import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ConfirmRemoveCellType from './confirm'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'

describe('ConfirmRemoveCellType', () => {
  const controller = new ConfirmRemoveCellType({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      journeyModel: {
        reset: jest.fn(),
      },
      // @ts-ignore
      services: {
        authService,
        locationsService,
      },
      // @ts-ignore
      session: {
        referrerUrl: '/',
      },
      // @ts-ignore
      sessionModel: {
        get: jest.fn(fieldName => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
        reset: jest.fn(),
      },
    }
    res = {
      // @ts-ignore
      locals: {
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
          prisonId: 'TST',
        }),
        residentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        // @ts-ignore
        user: {
          username: 'JTIMPSON',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.updateSpecialistCellTypes = jest.fn()
  })

  describe('locals', () => {
    it('formats the change summary correctly', () => {
      const result = controller.locals(req, res)
      expect(result).toEqual({
        backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/remove-cell-type/review',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `This will decrease the establishment’s working capacity from 20 to 19.
<br/><br/>
This will increase the establishment’s maximum capacity from 30 to 31.`,
      })
    })
  })

  describe('saveValues', () => {
    it('updates the capacity and then the cell types via the locations API', async () => {
      const locationsApiCalls: any[] = []
      const methodNames = ['updateCapacity', 'updateSpecialistCellTypes'] as const
      methodNames.forEach(methodName => {
        locationsService[methodName] = jest
          .fn()
          .mockImplementation((...args): any => locationsApiCalls.push({ methodName, args }))
      })

      await controller.saveValues(req, res, next)

      expect(locationsApiCalls).toEqual([
        {
          methodName: 'updateCapacity',
          args: ['token', 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2', 3, 1],
        },
        {
          methodName: 'updateSpecialistCellTypes',
          args: ['token', 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2', []],
        },
      ])
    })

    it('calls next when successful', async () => {
      await controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with any errors', async () => {
      const error = new Error('API error')
      locationsService.updateSpecialistCellTypes.mockRejectedValue(error)
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
        content: 'You have removed the cell type and updated the capacity for this location.',
        title: 'Cell updated',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
  })
})
