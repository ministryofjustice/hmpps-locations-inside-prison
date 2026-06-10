import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import ingestDetail, { changeText } from './detail'
import LocationsService from '../../../services/locationsService'
import { CellCertificateUpload } from '../../../data/types/locationsApi/cellCertificateUpload'

describe('Cell certificate uploads - detail', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const upload = {
    id: 'upload-1',
    prisonId: 'TST',
    status: 'FINISHED',
    totalRecords: 2,
    processedRecords: 1,
    skippedRecords: 1,
    failedRecords: 0,
    requestedBy: 'USER1',
    requestedDate: '2024-01-01T10:00:00',
    startTime: '2024-01-01T10:00:05',
    endTime: '2024-01-01T10:01:00',
    cellCertificateId: 'cert-1',
    locations: [
      {
        locationKey: 'TST-A-1-001',
        status: 'PROCESSED',
        maxCapacity: 2,
        workingCapacity: 1,
        certifiedNormalAccommodation: 2,
        previousMaxCapacity: 2,
        previousWorkingCapacity: 2,
        previousCertifiedNormalAccommodation: 2,
      },
      {
        locationKey: 'TST-A-1-002',
        status: 'SKIPPED',
        message: 'No changes required',
        maxCapacity: 2,
        workingCapacity: 2,
        certifiedNormalAccommodation: 2,
      },
    ],
  } as CellCertificateUpload

  beforeEach(() => {
    deepReq = {
      flash: jest.fn().mockReturnValue([]),
      session: { systemToken: 'token' },
      services: { locationsService },
      params: { uploadId: 'upload-1' },
    }
    deepRes = {
      locals: { prisonConfiguration: { prisonId: 'TST' } },
      render: jest.fn(),
    }
  })

  afterEach(() => jest.clearAllMocks())

  describe('changeText', () => {
    it('shows new value only when unchanged or no previous (handles 0)', () => {
      expect(changeText(undefined, 2)).toBe('2')
      expect(changeText(2, 2)).toBe('2')
      expect(changeText(1, 0)).toBe('1 → 0')
      expect(changeText(0, 1)).toBe('0 → 1')
      expect(changeText(2, undefined)).toBe('-')
    })
  })

  it('renders the detail page with summary, location rows and a cell certificate link when finished', async () => {
    locationsService.getCellCertificateUpload = jest.fn().mockResolvedValue(upload)

    await ingestDetail(deepReq as Request, deepRes as Response)

    expect(locationsService.getCellCertificateUpload).toHaveBeenCalledWith('token', 'upload-1')
    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/admin/ingest/detail',
      expect.objectContaining({
        upload,
        inProgress: false,
        cellCertificateUrl: '/TST/cell-certificate/cert-1',
        locationRows: [
          expect.objectContaining({
            locationKey: 'TST-A-1-001',
            status: 'PROCESSED',
            workingCapacityText: '2 → 1',
            maxCapacityText: '2',
          }),
          expect.objectContaining({ locationKey: 'TST-A-1-002', status: 'SKIPPED', message: 'No changes required' }),
        ],
      }),
    )
  })

  it('marks inProgress and omits the certificate link while not finished', async () => {
    locationsService.getCellCertificateUpload = jest
      .fn()
      .mockResolvedValue({ ...upload, status: 'STARTED', endTime: undefined, cellCertificateId: undefined })

    await ingestDetail(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/admin/ingest/detail',
      expect.objectContaining({ inProgress: true, cellCertificateUrl: undefined }),
    )
  })
})
