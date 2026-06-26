import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/createLocation/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import ConfirmEditCells from './confirm'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('Confirm edit cells', () => {
  const controller = new ConfirmEditCells({ route: '/' })
  const prisonId = 'TST'
  const locationId = '7e570000-0000-1000-8000-000000000001'

  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const next = jest.fn()
  let sessionModelData: { [key: string]: any }

  let locationsService: jest.Mocked<LocationsService>
  let analyticsService: jest.Mocked<AnalyticsService>

  beforeEach(() => {
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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  function setupScenario(params: {
    landingStatus: 'DRAFT' | 'ACTIVE'
    subLocations: ReturnType<typeof buildDecoratedLocation>[]
    sessionData: Record<string, any>
  }) {
    sessionModelData = { ...params.sessionData }

    deepRes = {
      locals: {
        cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
        errorlist: [],
        prisonId,
        locationId,
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {},
        decoratedResidentialSummary: {
          location: buildDecoratedLocation({
            prisonId,
            id: locationId,
            pathHierarchy: 'A-1',
            locationType: 'LANDING',
            status: params.landingStatus,
          }),
          subLocations: params.subLocations,
        },
      },
      redirect: jest.fn(),
    }
  }

  function runCommonTests(expectedCellsPayload: Record<string, any>[], noChangeSessionData: Record<string, any>) {
    describe('locals', () => {
      it('returns correct locals', () => {
        const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
        expect(result).toEqual(
          expect.objectContaining({
            locationPathPrefix: 'A-1',
            title: 'Edit cells',
            titleCaption: 'Landing A-1',
            buttonText: 'Update cells',
            backLink: `/view-and-update-locations/${prisonId}/${locationId}`,
          }),
        )
      })
    })

    describe('saveValues', () => {
      it('calls locationsService and updates res.locals', async () => {
        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(locationsService.editCells).toHaveBeenCalledWith('token', {
          accommodationType: 'NORMAL_ACCOMMODATION',
          cells: expectedCellsPayload,
          cellsUsedFor: ['CLOSE_SUPERVISION_CENTRE'],
          parentLocation: locationId,
          prisonId,
        })

        expect(analyticsService.sendEvent).toHaveBeenCalledWith(
          deepReq,
          'create_cells',
          expect.objectContaining({
            prison_id: prisonId,
            location_id: locationId,
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
        Object.assign(sessionModelData, noChangeSessionData)

        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/${prisonId}/${locationId}`)
      })
    })

    describe('successHandler', () => {
      it('resets the journey model', async () => {
        await controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepReq.flash).toHaveBeenCalledWith('success', {
          title: 'Cells updated',
          content: 'You have updated cells on A-1.',
        })

        expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/${prisonId}/${locationId}`)
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
  }

  describe('DRAFT landing with DRAFT cells', () => {
    beforeEach(() => {
      setupScenario({
        landingStatus: 'DRAFT',
        subLocations: [
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000002',
            pathHierarchy: 'A-1-001',
            code: '001',
            cellMark: '1',
            status: 'DRAFT',
            specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
            pendingChanges: {
              certifiedNormalAccommodation: 1,
              workingCapacity: 2,
              maxCapacity: 3,
            },
            currentCellCertificate: undefined,
            inCellSanitation: false,
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000003',
            pathHierarchy: 'A-1-002',
            code: '002',
            cellMark: '2',
            status: 'DRAFT',
            specialistCellTypes: [],
            pendingChanges: {
              certifiedNormalAccommodation: 1,
              workingCapacity: 2,
              maxCapacity: 3,
            },
            currentCellCertificate: undefined,
            inCellSanitation: true,
          }),
        ],
        sessionData: {
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
        },
      })
    })

    runCommonTests(
      [
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
      {
        'create-cells_cellsToCreate': '2',
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
        'create-cells_accommodationType': 'NORMAL_ACCOMMODATION',
        'create-cells_usedFor': ['CLOSE_SUPERVISION_CENTRE'],
      },
    )
  })

  describe('ACTIVE landing with mixed cell statuses', () => {
    beforeEach(() => {
      setupScenario({
        landingStatus: 'ACTIVE',
        subLocations: [
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000002',
            pathHierarchy: 'A-1-001',
            code: '001',
            cellMark: '1',
            status: 'ACTIVE',
            specialistCellTypes: [],
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000003',
            pathHierarchy: 'A-1-002',
            code: '002',
            cellMark: '2',
            status: 'LOCKED_DRAFT',
            specialistCellTypes: [],
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000006',
            pathHierarchy: 'A-1-003',
            code: '003',
            cellMark: '3',
            status: 'DRAFT',
            specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
            pendingChanges: {
              certifiedNormalAccommodation: 1,
              workingCapacity: 2,
              maxCapacity: 3,
            },
            currentCellCertificate: undefined,
            inCellSanitation: false,
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000007',
            pathHierarchy: 'A-1-004',
            code: '004',
            cellMark: '4',
            status: 'DRAFT',
            specialistCellTypes: [],
            pendingChanges: {
              certifiedNormalAccommodation: 1,
              workingCapacity: 2,
              maxCapacity: 3,
            },
            currentCellCertificate: undefined,
            inCellSanitation: true,
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000008',
            pathHierarchy: 'A-1-005',
            code: '005',
            cellMark: '5',
            status: 'DRAFT',
            specialistCellTypes: [],
            pendingChanges: {
              certifiedNormalAccommodation: 1,
              workingCapacity: 2,
              maxCapacity: 3,
            },
            currentCellCertificate: undefined,
            inCellSanitation: false,
          }),
        ],
        sessionData: {
          'create-cells_cellsToCreate': '3',
          'create-cells_bulkSanitation': 'NO',
          'create-cells_withoutSanitation': ['0', '2'],
          'create-cells_cellNumber0': '003',
          'create-cells_doorNumber0': '33',
          'create-cells_baselineCna0': '1',
          'create-cells_workingCapacity0': '2',
          'create-cells_maximumCapacity0': '3',
          'saved-cellTypes0': ['BIOHAZARD_DIRTY_PROTEST'],
          'create-cells_cellNumber1': '004',
          'create-cells_doorNumber1': '4',
          'create-cells_baselineCna1': '1',
          'create-cells_workingCapacity1': '2',
          'create-cells_maximumCapacity1': '3',
          'create-cells_cellNumber2': '005',
          'create-cells_doorNumber2': '5',
          'create-cells_baselineCna2': '1',
          'create-cells_workingCapacity2': '2',
          'create-cells_maximumCapacity2': '3',
          'create-cells_accommodationType': 'NORMAL_ACCOMMODATION',
          'create-cells_usedFor': ['CLOSE_SUPERVISION_CENTRE'],
        },
      })
    })

    runCommonTests(
      [
        {
          id: '7e570000-0000-1000-8000-000000000006',
          cellMark: '33',
          certifiedNormalAccommodation: 1,
          code: '003',
          inCellSanitation: false,
          maxCapacity: 3,
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
          workingCapacity: 2,
        },
        {
          id: '7e570000-0000-1000-8000-000000000007',
          cellMark: '4',
          certifiedNormalAccommodation: 1,
          code: '004',
          inCellSanitation: true,
          maxCapacity: 3,
          specialistCellTypes: [],
          workingCapacity: 2,
        },
        {
          id: '7e570000-0000-1000-8000-000000000008',
          cellMark: '5',
          certifiedNormalAccommodation: 1,
          code: '005',
          inCellSanitation: false,
          maxCapacity: 3,
          specialistCellTypes: [],
          workingCapacity: 2,
        },
      ],
      {
        'create-cells_cellsToCreate': '3',
        'create-cells_bulkSanitation': 'NO',
        'create-cells_withoutSanitation': ['0', '2'],
        'create-cells_cellNumber0': '003',
        'create-cells_doorNumber0': '3',
        'create-cells_baselineCna0': '1',
        'create-cells_workingCapacity0': '2',
        'create-cells_maximumCapacity0': '3',
        'saved-cellTypes0': ['BIOHAZARD_DIRTY_PROTEST'],
        'create-cells_cellNumber1': '004',
        'create-cells_doorNumber1': '4',
        'create-cells_baselineCna1': '1',
        'create-cells_workingCapacity1': '2',
        'create-cells_maximumCapacity1': '3',
        'create-cells_cellNumber2': '005',
        'create-cells_doorNumber2': '5',
        'create-cells_baselineCna2': '1',
        'create-cells_workingCapacity2': '2',
        'create-cells_maximumCapacity2': '3',
        'create-cells_accommodationType': 'NORMAL_ACCOMMODATION',
        'create-cells_usedFor': ['CLOSE_SUPERVISION_CENTRE'],
      },
    )
  })
})
