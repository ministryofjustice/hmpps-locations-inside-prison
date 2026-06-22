import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import controller from './index'
import { CellCertificateDashboardEntry } from '../../data/types/locationsApi/cellCertificateDashboard'

describe('capacity management dashboard', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const buildEntry = (prisonId: string): CellCertificateDashboardEntry => ({
    prisonId,
    prisonName: `${prisonId} (HMP)`,
    certifiedWorkingCapacity: 100,
    signedOperationCapacity: 95,
    pendingChangeRequests: 0,
    certificateLastUpdated: '2025-02-02T12:00:00',
  })

  const allPrisons = [buildEntry('LEI'), buildEntry('MDI'), buildEntry('BMI')]

  beforeEach(() => {
    deepReq = {
      session: {
        systemToken: 'token',
      },
      services: {
        locationsService: {
          getCellCertificateDashboard: jest.fn().mockResolvedValue(allPrisons),
        },
      },
    }
    deepRes = {
      locals: {
        user: {
          caseloads: [
            { id: 'LEI', name: 'Leeds (HMP)' },
            { id: 'MDI', name: 'Moorland (HMP)' },
          ],
        },
      },
      render: jest.fn(),
    }
  })

  it('fetches the dashboard with the system token', async () => {
    await controller(deepReq as Request, deepRes as Response)

    expect(deepReq.services.locationsService.getCellCertificateDashboard).toHaveBeenCalledWith('token')
  })

  it('renders only prisons within the user caseloads', async () => {
    await controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/capacityManagementDashboard/index', {
      title: 'Capacity management dashboard',
      dashboard: [buildEntry('LEI'), buildEntry('MDI')],
    })
  })

  it('renders an empty dashboard when the user has no caseloads', async () => {
    deepRes.locals.user.caseloads = []

    await controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/capacityManagementDashboard/index', {
      title: 'Capacity management dashboard',
      dashboard: [],
    })
  })

  it('renders an empty dashboard when the user caseloads are undefined', async () => {
    deepRes.locals.user.caseloads = undefined

    await controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/capacityManagementDashboard/index', {
      title: 'Capacity management dashboard',
      dashboard: [],
    })
  })
})
