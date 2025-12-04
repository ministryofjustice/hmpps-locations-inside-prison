import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/createLocation/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import ConfirmCreateCells from './confirm'

describe('Confirm create cells', () => {
  const controller = new ConfirmCreateCells({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const next = jest.fn()
  let sessionModelData: { [key: string]: any }

  let locationsService: jest.Mocked<LocationsService>
  let analyticsService: jest.Mocked<AnalyticsService>

  beforeEach(() => {
    sessionModelData = {
      'create-cells_cellsToCreate': 2,
      'create-cells_bulkSanitation': false,
      'create-cells_withoutSanitation': ['0'],
      'create-cells_cellNumber0': '1',
      'create-cells_doorNumber0': '1',
      'create-cells_baselineCna0': '1',
      'create-cells_workingCapacity0': '2',
      'create-cells_maximumCapacity0': '3',
      'saved-cellTypes0': ['BIOHAZARD_DIRTY_PROTEST'],
      'create-cells_cellNumber1': '2',
      'create-cells_doorNumber1': '2',
      'create-cells_baselineCna1': '1',
      'create-cells_workingCapacity1': '2',
      'create-cells_maximumCapacity1': '3',
      'create-cells_accommodationType': 'NORMAL_ACCOMMODATION',
      'create-cells_usedFor': ['CLOSE_SUPERVISION_CENTRE'],
    }

    locationsService = {
      createCells: jest.fn(),
    } as unknown as jest.Mocked<LocationsService>

    analyticsService = {
      sendEvent: jest.fn(),
    } as unknown as jest.Mocked<AnalyticsService>

    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {
          fields,
        },
        values: {},
      },
      services: {
        analyticsService,
        locationsService,
      },
      sessionModel: {
        set: (key: string, value: any) => {
          sessionModelData[key] = value
        },
        get: (key: string) => sessionModelData[key],
        reset: () => {
          sessionModelData = {}
        },
        unset: (key: string) => delete sessionModelData[key],
      },
      journeyModel: {
        reset: jest.fn(),
      },
      body: {},
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        locationId: '7e570000-0000-1000-8000-000000000001',
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {},
        decoratedResidentialSummary: {
          location: {
            prisonId: 'TST',
            id: '7e570000-0000-1000-8000-000000000001',
            pathHierarchy: 'A-1',
            locationType: 'Landing',
          },
        },
      },
      redirect: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('locals', () => {
    it('returns correct locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
      expect(result).toEqual(
        expect.objectContaining({
          locationPathPrefix: 'A-1',
          title: 'Check and confirm the cell details',
          titleCaption: 'Create cells on landing A-1',
          buttonText: 'Create cells',
          cancelText: 'Cancel',
        }),
      )
    })
  })

  describe('saveValues', () => {
    it('calls locationsService and updates res.locals', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.createCells).toHaveBeenCalledWith('token', {
        accommodationType: 'NORMAL_ACCOMMODATION',
        cells: [
          {
            cellMark: '1',
            certifiedNormalAccommodation: 1,
            code: '001',
            inCellSanitation: false,
            maxCapacity: 3,
            specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
            workingCapacity: 2,
          },
          {
            cellMark: '2',
            certifiedNormalAccommodation: 1,
            code: '002',
            inCellSanitation: true,
            maxCapacity: 3,
            specialistCellTypes: [],
            workingCapacity: 2,
          },
        ],
        cellsUsedFor: ['CLOSE_SUPERVISION_CENTRE'],
        parentLocation: '7e570000-0000-1000-8000-000000000001',
        prisonId: 'TST',
      })

      expect(sessionModelData.newLocation).toEqual(await locationsService.createCells('', {} as any))

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(
        deepReq,
        'create_cells',
        expect.objectContaining({
          prison_id: 'TST',
          location_id: '7e570000-0000-1000-8000-000000000001',
        }),
      )
    })

    it('calls next with error if Api error', async () => {
      const error = new Error('some error')
      locationsService.createCells.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(async () => {
      sessionModelData.newLocation = await locationsService.createCells('', {} as any)
    })

    it('resets the journey model', async () => {
      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Cells created',
        content: 'You have created 2 cells on landing A-1.',
      })

      expect(deepRes.redirect).toHaveBeenCalledWith(
        `/view-and-update-locations/TST/7e570000-0000-1000-8000-000000000001`,
      )
    })

    it('flashes success with localName if available', async () => {
      deepRes.locals.decoratedResidentialSummary.location.localName = 'North Landing'

      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Cells created',
        content: 'You have created 2 cells on landing North Landing.',
      })
    })
  })
})
