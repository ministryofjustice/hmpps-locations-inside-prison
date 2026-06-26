import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import EditCellsInit from './init'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('EditCellsInit', () => {
  const controller = new EditCellsInit({ route: '/' })
  const prisonId = 'TST'
  const locationId = '7e570000-0000-0000-0000-000000000001'

  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      form: { options: {} },
      session: {},
      sessionModel: { set: jest.fn() },
      journeyModel: { set: jest.fn() },
      query: {
        prisonId,
        locationId: 'l0',
      },
    }
  })

  function setupScenario(params: {
    landingStatus: 'DRAFT' | 'ACTIVE'
    subLocations: ReturnType<typeof buildDecoratedLocation>[]
  }) {
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          subLocationName: 'Cells',
          location: buildDecoratedLocation({
            prisonId,
            id: locationId,
            locationType: 'LANDING',
            localName: 'Landing A',
            status: params.landingStatus,
          }),
          subLocations: params.subLocations,
        },
      },
      redirect: jest.fn(),
    }
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
            inCellSanitation: true,
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
            inCellSanitation: false,
          }),
        ],
      })
    })

    describe('successHandler', () => {
      it('redirects if location status is LOCKED_DRAFT', () => {
        deepRes.locals.decoratedResidentialSummary.location = {
          ...deepRes.locals.decoratedResidentialSummary.location,
          status: 'LOCKED_DRAFT',
          pendingApprovalRequestId: 'REQUEST-ID-0000-1000',
        }

        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.redirect).toHaveBeenCalledWith(`/view-and-update-locations/${prisonId}/${locationId}`)
      })

      it('sets values on the sessionModel', () => {
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationType', 'Landing')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationId', locationId)
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('localName', 'Landing A')

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellsToCreate', '2')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_accommodationType', 'NORMAL_ACCOMMODATION')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_usedFor', ['CLOSE_SUPERVISION_CENTRE'])
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_bulkSanitation', 'NO')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_withoutSanitation', ['1'])

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellNumber0', '001')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_doorNumber0', '1')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_baselineCna0', '1')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_workingCapacity0', '2')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_maximumCapacity0', '3')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('saved-cellTypes0', ['BIOHAZARD_DIRTY_PROTEST'])

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellNumber1', '002')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_doorNumber1', '2')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_baselineCna1', '1')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_workingCapacity1', '2')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_maximumCapacity1', '3')
        expect(deepReq.sessionModel.set).not.toHaveBeenCalledWith('saved-cellTypes1', ['BIOHAZARD_DIRTY_PROTEST'])
      })
    })
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
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000003',
            pathHierarchy: 'A-1-002',
            code: '002',
            cellMark: '2',
            status: 'LOCKED_DRAFT',
          }),
          buildDecoratedLocation({
            id: '7e570000-0000-1000-8000-000000000004',
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
            id: '7e570000-0000-1000-8000-000000000005',
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
            id: '7e570000-0000-1000-8000-000000000006',
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
      })
    })

    describe('successHandler', () => {
      it('sets values on the sessionModel for DRAFT cells only', () => {
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellsToCreate', '3')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_accommodationType', 'NORMAL_ACCOMMODATION')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_usedFor', ['CLOSE_SUPERVISION_CENTRE'])
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_bulkSanitation', 'NO')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_withoutSanitation', ['0', '2'])

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellNumber0', '003')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_doorNumber0', '3')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('saved-cellTypes0', ['BIOHAZARD_DIRTY_PROTEST'])

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellNumber1', '004')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_doorNumber1', '4')
        expect(deepReq.sessionModel.set).not.toHaveBeenCalledWith('saved-cellTypes1', ['BIOHAZARD_DIRTY_PROTEST'])

        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_cellNumber2', '005')
        expect(deepReq.sessionModel.set).toHaveBeenCalledWith('create-cells_doorNumber2', '5')

        expect(deepReq.sessionModel.set).not.toHaveBeenCalledWith('create-cells_cellNumber0', '001')
        expect(deepReq.sessionModel.set).not.toHaveBeenCalledWith('create-cells_cellNumber1', '002')
      })
    })
  })
})
