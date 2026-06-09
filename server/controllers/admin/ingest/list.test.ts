import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import ingestList from './list'
import LocationsService from '../../../services/locationsService'
import { CellCertificateUpload } from '../../../data/types/locationsApi/cellCertificateUpload'

describe('Cell certificate uploads - list', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const finishedUpload = {
    id: 'upload-1',
    prisonId: 'TST',
    status: 'FINISHED',
    totalRecords: 3,
    processedRecords: 2,
    skippedRecords: 1,
    failedRecords: 0,
    requestedBy: 'USER1',
    requestedDate: '2024-01-01T10:00:00',
  } as CellCertificateUpload

  beforeEach(() => {
    deepReq = {
      flash: jest.fn().mockReturnValue([]),
      session: { systemToken: 'token' },
      services: { locationsService },
    }
    deepRes = {
      locals: { prisonConfiguration: { prisonId: 'TST' } },
      render: jest.fn(),
    }
  })

  afterEach(() => jest.clearAllMocks())

  it('renders the uploads list with hasInProgress false when all are finished', async () => {
    locationsService.getCellCertificateUploads = jest.fn().mockResolvedValue([finishedUpload])

    await ingestList(deepReq as Request, deepRes as Response)

    expect(locationsService.getCellCertificateUploads).toHaveBeenCalledWith('token', 'TST')
    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/admin/ingest/list',
      expect.objectContaining({
        uploads: [finishedUpload],
        hasInProgress: false,
        newUploadUrl: '/admin/TST/ingest-cert/new',
      }),
    )
  })

  it('sets hasInProgress true when an upload is pending or started', async () => {
    locationsService.getCellCertificateUploads = jest
      .fn()
      .mockResolvedValue([finishedUpload, { ...finishedUpload, id: 'upload-2', status: 'STARTED' }])

    await ingestList(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/admin/ingest/list',
      expect.objectContaining({ hasInProgress: true }),
    )
  })

  it('surfaces a flashed error as a validation error', async () => {
    locationsService.getCellCertificateUploads = jest.fn().mockResolvedValue([])
    deepReq.flash = jest
      .fn()
      .mockImplementation((key: string) =>
        key === 'error' ? [{ title: 'There is a problem', content: 'Upload already running' }] : [],
      )

    await ingestList(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/admin/ingest/list',
      expect.objectContaining({ validationErrors: [{ text: 'Upload already running', href: '#' }] }),
    )
  })
})
