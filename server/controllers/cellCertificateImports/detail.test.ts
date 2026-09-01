import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import importDetail, { capacityCell, changeText, heldAndCertifiedCell, maxCapacityCell } from './detail'
import LocationsService from '../../services/locationsService'
import { CellCertificateImport } from '../../data/types/locationsApi/cellCertificateImport'

describe('Cell certificate imports - detail', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const certificateImport = {
    id: 'import-1',
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
  } as CellCertificateImport

  beforeEach(() => {
    deepReq = {
      flash: jest.fn().mockReturnValue([]),
      session: { systemToken: 'token' },
      services: { locationsService },
      params: { importId: 'import-1' },
    }
    deepRes = {
      locals: { prisonConfiguration: { prisonId: 'TST' } },
      render: jest.fn(),
    }
  })

  afterEach(() => jest.clearAllMocks())

  describe('capacityCell', () => {
    it('shows the before → after change when the imported value was applied', () => {
      expect(capacityCell(2, 1, false)).toEqual({ text: '2 → 1' })
      expect(capacityCell(2, 2, false)).toEqual({ text: '2' })
    })

    it('shows the retained value alongside the certified one when they do not match', () => {
      expect(capacityCell(2, 1, true)).toEqual({ text: '2', certifiedText: '1' })
      expect(capacityCell(undefined, 0, true)).toEqual({ text: '-', certifiedText: '0' })
    })
  })

  describe('heldAndCertifiedCell', () => {
    it('shows the held value alone when the certificate agrees', () => {
      expect(heldAndCertifiedCell(2, 2)).toEqual({ text: '2' })
      expect(heldAndCertifiedCell(0, 0)).toEqual({ text: '0' })
    })

    it('shows the certified value beneath the held one when they differ', () => {
      expect(heldAndCertifiedCell(1, 2)).toEqual({ text: '1', certifiedText: '2' })
      expect(heldAndCertifiedCell(2, 0)).toEqual({ text: '2', certifiedText: '0' })
      expect(heldAndCertifiedCell(undefined, 0)).toEqual({ text: '-', certifiedText: '0' })
    })
  })

  describe('maxCapacityCell', () => {
    it('shows the change the location took, with the certified value when it differs', () => {
      // a certified max capacity of 0 the location had to take as 1
      expect(maxCapacityCell({ previousMaxCapacity: 2, maxCapacity: 0, appliedMaxCapacity: 1 })).toEqual({
        text: '2 → 1',
        certifiedText: '0',
      })
    })

    it('shows no change when the location took the certified value', () => {
      expect(maxCapacityCell({ previousMaxCapacity: 2, maxCapacity: 3, appliedMaxCapacity: 3 })).toEqual({
        text: '2 → 3',
      })
    })

    it('falls back to the mismatch flag for uploads processed before the applied value was recorded', () => {
      expect(maxCapacityCell({ previousMaxCapacity: 2, maxCapacity: 3 })).toEqual({ text: '2 → 3' })
      expect(maxCapacityCell({ previousMaxCapacity: 2, maxCapacity: 1, maxCapacityMismatch: true })).toEqual({
        text: '2',
        certifiedText: '1',
      })
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
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue(certificateImport)

    await importDetail(deepReq as Request, deepRes as Response)

    expect(locationsService.getCellCertificateImport).toHaveBeenCalledWith('token', 'import-1')
    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/detail',
      expect.objectContaining({
        certificateImport,
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

  it('never shows a working capacity as a change, because an import cannot make one', async () => {
    // a temporarily deactivated cell: the mismatch flag is deliberately suppressed for these, but the
    // location still did not move its working capacity to the uploaded value
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({
      ...certificateImport,
      locations: [
        {
          locationKey: 'TST-G-2-010',
          status: 'PROCESSED',
          maxCapacity: 0,
          workingCapacity: 2,
          previousMaxCapacity: 2,
          appliedMaxCapacity: 1,
          previousWorkingCapacity: 1,
        },
      ],
    } as CellCertificateImport)

    await importDetail(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/detail',
      expect.objectContaining({
        locationRows: [
          expect.objectContaining({
            locationKey: 'TST-G-2-010',
            needsReview: false,
            workingCapacity: { text: '1', certifiedText: '2' },
            maxCapacity: { text: '2 → 1', certifiedText: '0' },
          }),
        ],
      }),
    )
  })

  it('lifts the cells needing review above the rest', async () => {
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({
      ...certificateImport,
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

    await importDetail(deepReq as Request, deepRes as Response)

    const { locationRows } = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(locationRows.map((row: { locationKey: string }) => row.locationKey)).toEqual([
      'TST-A-1-003',
      'TST-A-1-001',
      'TST-A-1-002',
    ])
  })

  it('marks inProgress and omits the certificate link while not finished', async () => {
    locationsService.getCellCertificateImport = jest
      .fn()
      .mockResolvedValue({ ...certificateImport, status: 'STARTED', endTime: undefined, cellCertificateId: undefined })

    await importDetail(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/detail',
      expect.objectContaining({ inProgress: true, cellCertificateUrl: undefined }),
    )
  })
})
