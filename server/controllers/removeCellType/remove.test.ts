import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import fields from '../../routes/removeCellType/fields'
import RemoveCellType from './remove'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'

describe('RemoveCellType', () => {
  const controller = new RemoveCellType({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          maxCapacity: '2',
          workingCapacity: '1',
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      // @ts-ignore
      services: {
        authService,
        locationsService,
      },
      // @ts-ignore
      sessionModel: {
        get: jest.fn((fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
        reset: jest.fn(),
      },
    } as unknown as FormWizard.Request
    res = {
      locals: {
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'MDI',
        }),
        // @ts-ignore
        user: {
          username: 'JTIMPSON',
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.updateSpecialistCellTypes = jest.fn()
  })

  describe('locals', () => {
    it('returns the expected locals for a single cell type', () => {
      res.locals.location.specialistCellTypes = ['Accessible cell']
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        buttonText: 'Remove cell type',
        cellTypesLabel: 'Cell type:',
        cellTypesText: 'Accessible cell',
        pageTitleText: 'Are you sure you want to remove the specific cell type?',
      })
    })

    it('returns the expected locals for multiple cell types', () => {
      res.locals.location.specialistCellTypes = ['Dry cell', 'Escape list cell']
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        buttonText: 'Remove cell types',
        cellTypesLabel: 'Cell types:',
        cellTypesText: 'Dry cell, Escape list cell',
        pageTitleText: 'Are you sure you want to remove all of the specific cell types?',
      })
    })
  })

  describe('saveValues', () => {
    it('removes the cell types via the locations API', async () => {
      await controller.saveValues(req, res, next)
      expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        [],
      )
    })

    it('calls next when successful', async () => {
      await controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with any errors', async () => {
      const error = new Error('API error')
      ;(locationsService.updateSpecialistCellTypes as jest.Mock).mockRejectedValue(error)
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
        content: 'You have removed the specific cell type for this location.',
        title: 'Cell type removed',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
  })
})
