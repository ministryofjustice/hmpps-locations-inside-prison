import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import SetCellType from '.'
import fields from '../../routes/setCellTypeOld/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('SetCellType', () => {
  const controller = new SetCellType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  const allCellTypes = [
    {
      key: 'ACCESSIBLE_CELL',
      description: 'Accessible cell',
      additionalInformation: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
    },
    {
      key: 'BIOHAZARD_DIRTY_PROTEST',
      description: 'Biohazard / dirty protest cell',
      additionalInformation: 'Previously known as a dirty protest cell',
    },
    {
      key: 'CONSTANT_SUPERVISION',
      description: 'Constant Supervision Cell',
    },
  ]

  const decoratedLocation = buildDecoratedLocation({
    specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
  })

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          'set-cell-type_accommodationType': 'NORMAL_ACCOMMODATION',
          'set-cell-type_normalCellTypes': ['N1', 'N2'],
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
        get: jest.fn(
          (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
        reset: jest.fn(),
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation,
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
          username: 'JTIMPSON',
        },
        values: {
          specialistCellTypes: ['CAT_A'],
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.getSpecialistCellTypes = jest.fn().mockResolvedValue(allCellTypes)
    locationsService.updateSpecialistCellTypes = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('saveValues', () => {
    describe('when normal cell types are chosen', () => {
      it('saves the correct types via the locations API', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
        expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
          'token',
          '7e570000-0000-0000-0000-000000000001',
          ['N1', 'N2'],
        )
      })
    })

    describe('when a special cell type is chosen', () => {
      beforeEach(() => {
        deepReq.form.values = {
          'set-cell-type_accommodationType': 'SPECIAL_ACCOMMODATION',
          'set-cell-type_normalCellTypes': ['N1', 'N2'],
          'set-cell-type_specialistCellTypes': 'S',
        }
      })

      it('saves the correct types via the locations API', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
        expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
          'token',
          '7e570000-0000-0000-0000-000000000001',
          ['S'],
        )
      })
    })

    it('sends an analytics event when setting cell type', async () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = []

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'set_cell_type', { prison_id: 'TST' })
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
        content: 'You have set a cell type for A-1-001.',
        title: 'Cell type set',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })
})
