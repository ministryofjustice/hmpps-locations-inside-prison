import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import ingestDetail, { capacityCell, changeText } from './detail'
import LocationsService from '../../services/locationsService'
import { CellCertificateUpload } from '../../data/types/locationsApi/cellCertificateUpload'

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
    discrepancyRecords: 1,
    requestedBy: 'USER1',
    requestedDate: '2024-01-01T10:00:00',
    startTime: '2024-01-01T10:00:05',
    endTime: '2024-01-01T10:01:00',
    cellCertificateId: 'cert-1',
    locations: [
      {
        locationKey: 'TST-A-1-001',
        status: 'PROCESSED',
        message: 'Working capacity and certified working capacity do not match',
        maxCapacity: 3,
        workingCapacity: 1,
        certifiedNormalAccommodation: 2,
        previousMaxCapacity: 2,
        previousWorkingCapacity: 2,
        previousCertifiedNormalAccommodation: 2,
        workingCapacityMismatch: true,
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

  describe('capacityCell', () => {
    it('shows the before → after change when the uploaded value was applied', () => {
      expect(capacityCell(2, 1, false)).toEqual({ text: '2 → 1' })
      expect(capacityCell(2, 2, false)).toEqual({ text: '2' })
    })

    it('shows the retained value alongside the certified one when they do not match', () => {
      expect(capacityCell(2, 1, true)).toEqual({ text: '2', certifiedText: '1' })
      expect(capacityCell(undefined, 0, true)).toEqual({ text: '-', certifiedText: '0' })
    })
  })

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
      'pages/cellCertificateUploads/detail',
      expect.objectContaining({
        upload,
        inProgress: false,
        cellCertificateUrl: '/TST/cell-certificate/cert-1',
        locationRows: [
          expect.objectContaining({
            locationKey: 'TST-A-1-001',
            status: 'PROCESSED',
            needsReview: true,
            // the location kept its working capacity of 2 while the certificate records 1
            workingCapacity: { text: '2', certifiedText: '1' },
            maxCapacity: { text: '2 → 3' },
          }),
          expect.objectContaining({
            locationKey: 'TST-A-1-002',
            status: 'SKIPPED',
            needsReview: false,
            message: 'No changes required',
          }),
        ],
      }),
    )
  })

  it('lifts the cells needing review above the rest', async () => {
    locationsService.getCellCertificateUpload = jest.fn().mockResolvedValue({
      ...upload,
      locations: [
        { locationKey: 'TST-A-1-001', status: 'SKIPPED', maxCapacity: 2, workingCapacity: 2 },
        { locationKey: 'TST-A-1-002', status: 'SKIPPED', maxCapacity: 2, workingCapacity: 2 },
        {
          locationKey: 'TST-A-1-003',
          status: 'PROCESSED',
          maxCapacity: 2,
          workingCapacity: 1,
          workingCapacityMismatch: true,
        },
      ],
    })

    await ingestDetail(deepReq as Request, deepRes as Response)

    const { locationRows } = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(locationRows.map((row: { locationKey: string }) => row.locationKey)).toEqual([
      'TST-A-1-003',
      'TST-A-1-001',
      'TST-A-1-002',
    ])
  })

  it('marks inProgress and omits the certificate link while not finished', async () => {
    locationsService.getCellCertificateUpload = jest
      .fn()
      .mockResolvedValue({ ...upload, status: 'STARTED', endTime: undefined, cellCertificateId: undefined })

    await ingestDetail(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateUploads/detail',
      expect.objectContaining({ inProgress: true, cellCertificateUrl: undefined }),
    )
  })
})
