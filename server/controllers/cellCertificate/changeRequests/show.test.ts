import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import show from './show'
import LocationsService from '../../../services/locationsService'
import { CellCertificateUpload } from '../../../data/types/locationsApi/cellCertificateUpload'
import { CertificationApprovalRequestType } from '../../../data/types/locationsApi/certificationApprovalRequest'

jest.mock('../../../services/locationsService')
jest.mock('../../../middleware/populateCertificationRequestDetails')

describe('Cell certificate change request - show', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const upload = {
    id: 'upload-1',
    prisonId: 'TST',
    status: 'FINISHED',
    totalRecords: 3,
    processedRecords: 2,
    skippedRecords: 1,
    failedRecords: 0,
    discrepancyRecords: 1,
    requestedBy: 'USER1',
    requestedDate: '2024-01-01T10:00:00',
    locations: [
      {
        locationKey: 'TST-A-1-001',
        status: 'PROCESSED',
        message: 'Working capacity and certified working capacity do not match',
        maxCapacity: 2,
        workingCapacity: 1,
        previousMaxCapacity: 2,
        previousWorkingCapacity: 2,
        workingCapacityMismatch: true,
      },
      { locationKey: 'TST-A-1-002', status: 'SKIPPED', maxCapacity: 2, workingCapacity: 2 },
    ],
  } as CellCertificateUpload

  const buildRes = (approvalType: CertificationApprovalRequestType): DeepPartial<Response> => ({
    locals: {
      approvalRequest: { id: 'request-1', approvalType, status: 'APPROVED' as const },
      constants: { approvalTypes: [{ key: approvalType, description: 'Initial cell certificate import' }] },
      prisonId: 'TST',
      location: undefined as undefined,
    },
    render: jest.fn(),
  })

  beforeEach(() => {
    deepReq = {
      session: { systemToken: 'token' },
      services: { locationsService },
    }
    deepRes = buildRes('CELL_CERTIFICATE_UPLOAD')
  })

  afterEach(() => jest.clearAllMocks())

  it('shows only the cells needing review for an initial cell certificate import', async () => {
    locationsService.getCellCertificateUploadByApprovalRequest = jest.fn().mockResolvedValue(upload)

    await show(deepReq as Request, deepRes as Response)

    expect(locationsService.getCellCertificateUploadByApprovalRequest).toHaveBeenCalledWith('token', 'request-1')

    const { ingestion } = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(ingestion.upload).toEqual(upload)
    expect(ingestion.reportUrl).toBe('/TST/cell-certificate-uploads/upload/upload-1')
    // the unchanged cell is left out - a prison's import covers every cell
    expect(ingestion.rows).toEqual([
      expect.objectContaining({
        locationKey: 'TST-A-1-001',
        workingCapacity: { text: '2', certifiedText: '1' },
        maxCapacity: { text: '2' },
      }),
    ])
  })

  it('does not look for an ingestion for any other approval type', async () => {
    locationsService.getCellCertificateUploadByApprovalRequest = jest.fn()
    deepRes = buildRes('CAPACITY_CHANGE')

    await show(deepReq as Request, deepRes as Response)

    expect(locationsService.getCellCertificateUploadByApprovalRequest).not.toHaveBeenCalled()
    expect((deepRes.render as jest.Mock).mock.calls[0][1].ingestion).toBeUndefined()
  })

  // Imports that predate the link between an upload and its approval request have nothing to find.
  it('renders the page unchanged when there is no ingestion behind the request', async () => {
    locationsService.getCellCertificateUploadByApprovalRequest = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))

    await show(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificate/changeRequests/show',
      expect.objectContaining({ ingestion: undefined }),
    )
  })
})
