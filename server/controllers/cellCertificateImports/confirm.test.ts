import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import { DeepPartial } from 'fishery'
import ImportConfirm from './confirm'
import fields from '../../routes/changeLocalName/fields'
import LocationsService from '../../services/locationsService'
import paths from '../../utils/paths'

describe('Import the cell cert data - confirm', () => {
  const controller = new ImportConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const capacityData = {
    'TST-A-1-001': {
      maxCapacity: 2,
      workingCapacity: 1,
      certifiedNormalAccommodation: 2,
      cellMark: 'A1-01',
      inCellSanitation: true,
    },
  }

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: { fields },
        values: {},
      },
      services: {
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(),
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
    }

    deepRes = {
      locals: {
        prisonConfiguration: {
          prisonId: 'TST',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual(
        expect.objectContaining({
          buttonText: 'Confirm import',
        }),
      )
    })
  })

  describe('saveValues', () => {
    it('requests an async cell certificate import and stores the import id', async () => {
      deepReq.sessionModel.get = jest.fn().mockImplementation(key => (key === 'capacityData' ? capacityData : null))
      locationsService.requestCellCertificateImport = jest.fn().mockResolvedValueOnce({ id: 'import-1' })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.requestCellCertificateImport).toHaveBeenCalledWith('token', 'TST', capacityData)
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('importId', 'import-1')
      expect(next).toHaveBeenCalled()
    })

    it('captures the API error message when the import cannot be started', async () => {
      deepReq.sessionModel.get = jest.fn().mockImplementation(key => (key === 'capacityData' ? capacityData : null))
      locationsService.requestCellCertificateImport = jest.fn().mockRejectedValueOnce({
        data: { userMessage: 'A cell certificate upload is already in progress for prison TST' },
      })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith(
        'importError',
        'A cell certificate upload is already in progress for prison TST',
      )
      expect(next).toHaveBeenCalled()
    })
  })

  describe('successHandler', () => {
    it('redirects to the new import detail page on success', () => {
      deepReq.sessionModel.get = jest.fn().mockImplementation(key => (key === 'importId' ? 'import-1' : undefined))

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
      expect(deepReq.flash).toHaveBeenCalledWith(
        'success',
        expect.objectContaining({ title: 'Cell certificate import started' }),
      )
      expect(deepRes.redirect).toHaveBeenCalledWith(`${paths.prison.cellCertificateImports('TST')}/import/import-1`)
    })

    it('redirects to the list with an error when the import failed to start', () => {
      deepReq.sessionModel.get = jest
        .fn()
        .mockImplementation(key => (key === 'importError' ? 'Something went wrong' : undefined))

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('error', {
        title: 'There is a problem',
        content: 'Something went wrong',
      })
      expect(deepRes.redirect).toHaveBeenCalledWith(paths.prison.cellCertificateImports('TST'))
    })
  })
})
