import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import fields from '../../routes/removeCellType/fields'
import RemoveCellType from './remove'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('RemoveCellType', () => {
  const controller = new RemoveCellType({ route: '/' })
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
          maxCapacity: '2',
          workingCapacity: '1',
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
        systemToken: 'token',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
        reset: jest.fn(),
      },
    }
    deepRes = {
      locals: {
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'MDI',
        }),
        user: {
          username: 'JTIMPSON',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.updateSpecialistCellTypes = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('returns the expected locals for a single cell type', () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = ['Accessible cell']
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        buttonText: 'Remove cell type',
        cellTypesLabel: 'Cell type:',
        cellTypesText: 'Accessible cell',
        title: 'Are you sure you want to remove the cell type?',
        titleCaption: 'Cell A-1-001',
      })
    })

    it('returns the expected locals for multiple cell types', () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = ['Dry cell', 'Escape list cell']
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        buttonText: 'Remove cell types',
        cellTypesLabel: 'Cell types:',
        cellTypesText: 'Dry cell, Escape list cell',
        title: 'Are you sure you want to remove all of the cell types?',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('saveValues', () => {
    it('removes the cell types via the locations API', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        [],
      )
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })

    it('sends an analytics event when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'remove_cell_type', { prison_id: 'MDI' })
    })

    it('calls next with any errors', async () => {
      const error = new Error('API error')
      ;(locationsService.updateSpecialistCellTypes as jest.Mock).mockRejectedValue(error)
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
        content: 'You have removed the cell type for this location.',
        title: 'Cell type removed',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })
  })
})
