import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import NonResidentialConversionConfirm from './confirm'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/nonResidentialConversion/fields'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('NonResidentialConversionConfirm', () => {
  const controller = new NonResidentialConversionConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {},
      },
      journeyModel: {
        reset: jest.fn(),
      },
      services: {
        analyticsService,
        locationsService,
      },
      session: {
        referrerUrl: '/',
        systemToken: 'token',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: string) =>
            ({
              convertedCellType: { text: 'Treatment room', value: 'TREATMENT_ROOM' },
              otherConvertedCellType: '',
            })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
        reset: jest.fn(),
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          localName: 'A-1-001',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          prisonId: 'TST',
        }),
        prisonResidentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          convertedCellType: {
            text: 'Treatment room',
            value: 'TREATMENT_ROOM',
          },
          otherConvertedCellType: '',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.convertCellToNonResCell = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('formats the change summary correctly with non-zero working cap and normal type', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual({
        buttonText: 'Confirm conversion',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `This will decrease the establishment’s working capacity from 20 to 19.
<br/><br/>
This will decrease the establishment’s maximum capacity from 30 to 28.`,
        convertedCellTypeDetails: 'Treatment room',
        title: 'Confirm conversion to non-residential room',
        titleCaption: 'A-1-001',
      })
    })

    it('formats the change summary correctly with zero working cap and other type', () => {
      deepReq.sessionModel.get = jest.fn(
        (fieldName?: string): any =>
          ({
            convertedCellType: { text: 'Other', value: 'OTHER' },
            otherConvertedCellType: 'Server room',
          })[fieldName],
      )
      deepRes.locals.decoratedLocation = buildDecoratedLocation({
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        capacity: {
          maxCapacity: 2,
          workingCapacity: 0,
        },
        prisonId: 'TST',
      })
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        buttonText: 'Confirm conversion',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: 'This will decrease the establishment’s maximum capacity from 30 to 28.',
        convertedCellTypeDetails: 'Other - Server room',
        title: 'Confirm conversion to non-residential room',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('saveValues', () => {
    it('converts the cell to non-residential via the locations API', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.convertCellToNonResCell).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'TREATMENT_ROOM',
        undefined,
      )
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })

    it('sends an analytics event when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'convert_to_non_res', {
        prison_id: 'TST',
        converted_cell_type: 'TREATMENT_ROOM',
      })
    })

    describe('when cell is occupied error occurs', () => {
      beforeEach(async () => {
        const error: any = new Error('API error: Cell is occupied')
        error.data = { errorCode: 109 }
        locationsService.convertCellToNonResCell.mockRejectedValue(error)

        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      })

      it('redirects to the cell occupied page', () => {
        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/non-residential-conversion/occupied',
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
      locationsService.convertCellToNonResCell.mockRejectedValue(error)
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
        title: 'Cell converted to non-residential room',
        content: 'You have converted A-1-001 into a non-residential room.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })
  })
})
