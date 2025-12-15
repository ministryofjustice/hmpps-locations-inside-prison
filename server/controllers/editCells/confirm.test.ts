import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/createLocation/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import ConfirmCreateCells from './confirm'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

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
      'create-cells_cellsToCreate': '3',
      'create-cells_bulkSanitation': 'NO',
      'create-cells_withoutSanitation': ['0'],
      'create-cells_cellNumber0': '001',
      'create-cells_doorNumber0': '1',
      'create-cells_baselineCna0': '1',
      'create-cells_workingCapacity0': '2',
      'create-cells_maximumCapacity0': '3',
      'saved-cellTypes0': ['BIOHAZARD_DIRTY_PROTEST'],
      'create-cells_cellNumber1': '002',
      'create-cells_doorNumber1': '2',
      'create-cells_baselineCna1': '1',
      'create-cells_workingCapacity1': '2',
      'create-cells_maximumCapacity1': '3',
      'create-cells_cellNumber2': '003',
      'create-cells_doorNumber2': '3',
      'create-cells_baselineCna2': '1',
      'create-cells_workingCapacity2': '2',
      'create-cells_maximumCapacity2': '3',
      'create-cells_accommodationType': 'NORMAL_ACCOMMODATION',
      'create-cells_usedFor': ['CLOSE_SUPERVISION_CENTRE'],
    }

    locationsService = {
      editCells: jest.fn(),
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
        toJSON: () => sessionModelData,
      },
      journeyModel: {
        reset: jest.fn(),
      },
      body: {},
    }

    deepRes = {
      locals: {
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-1000-8000-000000000001',
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
          location: buildDecoratedLocation({
            prisonId: 'TST',
            id: '7e570000-0000-1000-8000-000000000001',
            pathHierarchy: 'A-1',
            locationType: 'LANDING',
          }),
          subLocations: [
            buildDecoratedLocation({
              id: '7e570000-0000-1000-8000-000000000002',
              pathHierarchy: 'A-1-001',
              code: '001',
              cellMark: '1',
              pendingChanges: {
                certifiedNormalAccommodation: 1,
                workingCapacity: 2,
                maxCapacity: 3,
              },
            }),
            buildDecoratedLocation({
              id: '7e570000-0000-1000-8000-000000000003',
              pathHierarchy: 'A-1-002',
              code: '002',
              cellMark: '2',
              pendingChanges: {
                certifiedNormalAccommodation: 1,
                workingCapacity: 2,
                maxCapacity: 3,
              },
            }),
          ],
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
          title: 'Edit cells',
          titleCaption: 'Landing A-1',
          buttonText: 'Update cells',
          cancelText: 'Cancel',
          backLink: '/view-and-update-locations/TST/7e570000-0000-1000-8000-000000000001',
        }),
      )
    })
  })

  describe('saveValues', () => {
    it('calls locationsService and updates res.locals', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.editCells).toHaveBeenCalledWith('token', {
        accommodationType: 'NORMAL_ACCOMMODATION',
        cells: [
          {
            id: '7e570000-0000-1000-8000-000000000002',
            cellMark: '1',
            certifiedNormalAccommodation: 1,
            code: '001',
            inCellSanitation: false,
            maxCapacity: 3,
            specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
            workingCapacity: 2,
          },
          {
            id: '7e570000-0000-1000-8000-000000000003',
            cellMark: '2',
            certifiedNormalAccommodation: 1,
            code: '002',
            inCellSanitation: true,
            maxCapacity: 3,
            specialistCellTypes: [],
            workingCapacity: 2,
          },
          {
            cellMark: '3',
            certifiedNormalAccommodation: 1,
            code: '003',
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
      locationsService.editCells.mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('redirects out if no changes are made', async () => {
      Object.keys(sessionModelData).forEach(key => delete sessionModelData[key])
      Object.assign(sessionModelData, {
        'create-cells_cellsToCreate': '2',
        'create-cells_bulkSanitation': 'NO',
        'create-cells_withoutSanitation': ['0', '1'],
        'create-cells_cellNumber0': '001',
        'create-cells_doorNumber0': '1',
        'create-cells_baselineCna0': '1',
        'create-cells_workingCapacity0': '2',
        'create-cells_maximumCapacity0': '3',
        'saved-cellTypes0': ['BIOHAZARD_DIRTY_PROTEST'],
        'create-cells_cellNumber1': '002',
        'create-cells_doorNumber1': '2',
        'create-cells_baselineCna1': '1',
        'create-cells_workingCapacity1': '2',
        'create-cells_maximumCapacity1': '3',
        'saved-cellTypes1': ['BIOHAZARD_DIRTY_PROTEST'],
        'create-cells_accommodationType': 'NORMAL_ACCOMMODATION',
        'create-cells_usedFor': ['CLOSE_SUPERVISION_CENTRE'],
      })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith(
        `/view-and-update-locations/TST/7e570000-0000-1000-8000-000000000001`,
      )
    })
  })

  describe('successHandler', () => {
    it('resets the journey model', async () => {
      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Cells updated',
        content: 'You have updated cells on A-1.',
      })

      expect(deepRes.redirect).toHaveBeenCalledWith(
        `/view-and-update-locations/TST/7e570000-0000-1000-8000-000000000001`,
      )
    })

    it('flashes success with localName if available', async () => {
      deepRes.locals.decoratedResidentialSummary.location.localName = 'North Landing'

      await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Cells updated',
        content: 'You have updated cells on North Landing.',
      })
    })
  })
})
