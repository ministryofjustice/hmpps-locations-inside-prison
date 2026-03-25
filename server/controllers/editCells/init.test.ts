import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import CreateCellsInit from './init'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CreateCellsInit', () => {
  const controller = new CreateCellsInit({ route: '/' })
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
        prisonId: 'TST',
        locationId: 'l0',
      },
    }
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          subLocationName: 'Cells',
          location: buildDecoratedLocation({
            prisonId: 'TST',
            id: '7e570000-0000-0000-0000-000000000001',
            locationType: 'LANDING',
            localName: 'Landing A',
          }),
          subLocations: [
            buildDecoratedLocation({
              id: '7e570000-0000-1000-8000-000000000002',
              pathHierarchy: 'A-1-001',
              code: '001',
              cellMark: '1',
              status: 'DRAFT',
              pendingChanges: {
                certifiedNormalAccommodation: 1,
                workingCapacity: 2,
                maxCapacity: 3,
              },
              inCellSanitation: true,
            }),
            buildDecoratedLocation({
              id: '7e570000-0000-1000-8000-000000000003',
              pathHierarchy: 'A-1-002',
              code: '002',
              cellMark: '2',
              status: 'DRAFT',
              pendingChanges: {
                certifiedNormalAccommodation: 1,
                workingCapacity: 2,
                maxCapacity: 3,
              },
              inCellSanitation: false,
              specialistCellTypes: [],
            }),
          ],
        },
      },
      redirect: jest.fn(),
    }
  })

  describe('successHandler', () => {
    it('redirects if location status is LOCKED_DRAFT', () => {
      deepRes.locals.decoratedResidentialSummary.location = {
        ...deepRes.locals.decoratedResidentialSummary.location,
        status: 'LOCKED_DRAFT',
        pendingApprovalRequestId: 'REQUEST-ID-0000-1000',
      }

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })

    it('sets values on the sessionModel', () => {
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationType', 'Landing')
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('locationId', '7e570000-0000-0000-0000-000000000001')
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

      // No need to test journeyModel history setting, e2es will pick up any issues with that
    })
  })
})
