import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import importDetail, {
  capacityCell,
  changeText,
  heldAndCertifiedCell,
  maxCapacityCell,
  ADDED_MESSAGE,
  ADDED_PREVIEW_MESSAGE,
  CARRIED_FORWARD_MESSAGE,
  certificateChangeText,
  certificateTotalsRows,
  notOnCertificateLocationRows,
  workingCapacityCell,
} from './detail'
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

  describe('workingCapacityCell', () => {
    it('shows the change when a cell that held no working capacity took the certified value', () => {
      expect(
        workingCapacityCell({ previousWorkingCapacity: 0, workingCapacity: 1, appliedWorkingCapacity: 1 }),
      ).toEqual({ text: '0 → 1' })
    })

    it('shows the held value with the certified one beneath when the location kept its own', () => {
      expect(
        workingCapacityCell({ previousWorkingCapacity: 2, workingCapacity: 1, appliedWorkingCapacity: 2 }),
      ).toEqual({ text: '2', certifiedText: '1' })
      expect(
        workingCapacityCell({ previousWorkingCapacity: 2, workingCapacity: 2, appliedWorkingCapacity: 2 }),
      ).toEqual({ text: '2' })
    })

    it('treats uploads processed before the applied value was recorded as having kept their own', () => {
      expect(workingCapacityCell({ previousWorkingCapacity: 0, workingCapacity: 1 })).toEqual({
        text: '0',
        certifiedText: '1',
      })
      expect(workingCapacityCell({ previousWorkingCapacity: 2, workingCapacity: 2 })).toEqual({ text: '2' })
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

  describe('notOnCertificateLocationRows', () => {
    it('shows each cell with the single values it was added to the certificate at, linked to its location', async () => {
      const rows = notOnCertificateLocationRows(
        [
          {
            locationId: 'abc-123',
            locationKey: 'TST-A-1-003',
            maxCapacity: 2,
            workingCapacity: 0,
            certifiedNormalAccommodation: 1,
          },
        ],
        'TST',
      )

      expect(rows).toEqual([
        {
          locationKey: 'TST-A-1-003',
          url: '/TST/abc-123/view',
          status: 'ADDED',
          message: ADDED_MESSAGE,
          needsReview: false,
          certificateChange: undefined,
          maxCapacity: { text: '2' },
          // zero is a real value, not a missing one
          workingCapacity: { text: '0' },
          certifiedNormalAccommodation: { text: '1' },
        },
      ])
    })

    it('shows a cell already on the current certificate as carried forward', async () => {
      const [row] = notOnCertificateLocationRows(
        [
          {
            locationKey: 'TST-A-1-003',
            maxCapacity: 2,
            workingCapacity: 1,
            certifiedNormalAccommodation: 2,
            onCurrentCertificate: true,
          },
        ],
        'TST',
      )

      expect(row).toEqual(
        expect.objectContaining({
          status: 'CARRIED_FORWARD',
          message: CARRIED_FORWARD_MESSAGE,
          workingCapacity: { text: '1' },
        }),
      )
    })

    it('returns an empty list when there is nothing to report', async () => {
      expect(notOnCertificateLocationRows(undefined, 'TST')).toEqual([])
      expect(notOnCertificateLocationRows([], 'TST')).toEqual([])
    })

    it('omits the url only when a prison id is unavailable', async () => {
      const [row] = notOnCertificateLocationRows([{ locationKey: 'TST-A-1-003' }])

      expect(row.url).toBeUndefined()
      expect(row.maxCapacity).toEqual({ text: '-' })
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

  it('lists cells added from outside the file after the cells needing review and before the rest', async () => {
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({
      ...certificateImport,
      notOnCertificateRecords: 1,
      locationsNotOnCertificate: [
        {
          locationId: 'abc-123',
          locationKey: 'TST-A-1-003',
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
        },
      ],
    })

    await importDetail(deepReq as Request, deepRes as Response)

    const { locationRows } = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(locationRows.map((row: { locationKey: string }) => row.locationKey)).toEqual([
      'TST-A-1-001', // needs review
      'TST-A-1-003', // added to the certificate
      'TST-A-1-002', // unchanged
    ])
    expect(locationRows[1]).toEqual(
      expect.objectContaining({
        status: 'ADDED',
        url: '/TST/abc-123/view',
        workingCapacity: { text: '1' },
      }),
    )
  })

  it('shows a working capacity the location took from the certificate as a change', async () => {
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({
      ...certificateImport,
      locations: [
        {
          locationKey: 'TST-D-4-010',
          status: 'PROCESSED',
          message: 'Working capacity changed to match certified working capacity',
          maxCapacity: 1,
          workingCapacity: 1,
          certifiedNormalAccommodation: 1,
          previousMaxCapacity: 1,
          appliedMaxCapacity: 1,
          previousWorkingCapacity: 0,
          appliedWorkingCapacity: 1,
          previousCertifiedNormalAccommodation: 1,
        },
      ],
    } as CellCertificateImport)

    await importDetail(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/detail',
      expect.objectContaining({
        locationRows: [
          expect.objectContaining({
            locationKey: 'TST-D-4-010',
            needsReview: false,
            workingCapacity: { text: '0 → 1' },
            message: 'Working capacity changed to match certified working capacity',
          }),
        ],
      }),
    )
  })

  it('shows a working capacity the location kept without a mismatch flag as held, not as a change', async () => {
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
          appliedWorkingCapacity: 1,
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

  describe('previews', () => {
    const preview = {
      ...certificateImport,
      mode: 'PREVIEW',
      cellCertificateId: undefined,
      currentCertificateTotals: { maxCapacity: 10, workingCapacity: 9, certifiedNormalAccommodation: 8 },
      projectedCertificateTotals: { maxCapacity: 11, workingCapacity: 9, certifiedNormalAccommodation: 8 },
      notOnCertificateRecords: 1,
      locationsNotOnCertificate: [{ locationId: 'abc-123', locationKey: 'TST-A-1-003', maxCapacity: 1 }],
    } as CellCertificateImport

    const renderedLocals = () => (deepRes.render as jest.Mock).mock.calls[0][1]

    it('renders a finished preview with its totals and the option to continue', async () => {
      locationsService.getCellCertificateImport = jest.fn().mockResolvedValue(preview)

      await importDetail(deepReq as Request, deepRes as Response)

      expect(renderedLocals()).toEqual(
        expect.objectContaining({
          title: 'Preview of cell certificate import',
          isPreview: true,
          continueUrl: '/TST/cell-certificate-imports/import/import-1/continue',
          continuedImportUrl: undefined,
          cellCertificateUrl: undefined,
          certificateTotalsRows: [
            { label: 'Max capacity', current: '10', afterImport: '11', changed: true },
            { label: 'Working capacity', current: '9', afterImport: '9', changed: false },
            { label: 'CNA', current: '8', afterImport: '8', changed: false },
          ],
        }),
      )
      expect(renderedLocals().locationRows).toContainEqual(
        expect.objectContaining({ locationKey: 'TST-A-1-003', message: ADDED_PREVIEW_MESSAGE }),
      )
    })

    it('does not offer to continue a preview that is still being worked out', async () => {
      locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({ ...preview, status: 'STARTED' })

      await importDetail(deepReq as Request, deepRes as Response)

      expect(renderedLocals().continueUrl).toBeUndefined()
      expect(renderedLocals().inProgress).toBe(true)
    })

    it('links a continued preview to the import it became instead of offering to continue it again', async () => {
      locationsService.getCellCertificateImport = jest
        .fn()
        .mockResolvedValue({ ...preview, continuedAsUploadId: 'import-2' })

      await importDetail(deepReq as Request, deepRes as Response)

      expect(renderedLocals().continueUrl).toBeUndefined()
      expect(renderedLocals().continuedImportUrl).toEqual('/TST/cell-certificate-imports/import/import-2')
    })

    it('shows why a preview could not be continued', async () => {
      locationsService.getCellCertificateImport = jest.fn().mockResolvedValue(preview)
      deepReq.flash = jest
        .fn()
        .mockImplementation(type => (type === 'error' ? [{ title: 'There is a problem', content: 'Out of date' }] : []))

      await importDetail(deepReq as Request, deepRes as Response)

      expect(renderedLocals().validationErrors).toEqual([{ text: 'Out of date', href: '#' }])
    })

    it('never offers to continue an import', async () => {
      locationsService.getCellCertificateImport = jest.fn().mockResolvedValue(certificateImport)

      await importDetail(deepReq as Request, deepRes as Response)

      expect(renderedLocals()).toEqual(
        expect.objectContaining({ isPreview: false, continueUrl: undefined, certificateTotalsRows: [] }),
      )
    })
  })

  describe('certificateTotalsRows', () => {
    it('shows every total as changed when the prison has no certificate yet', () => {
      const rows = certificateTotalsRows({
        ...certificateImport,
        projectedCertificateTotals: { maxCapacity: 3, workingCapacity: 2, certifiedNormalAccommodation: 1 },
      })

      expect(rows).toEqual([
        { label: 'Max capacity', current: '-', afterImport: '3', changed: true },
        { label: 'Working capacity', current: '-', afterImport: '2', changed: true },
        { label: 'CNA', current: '-', afterImport: '1', changed: true },
      ])
    })

    it('shows nothing when the totals could not be worked out', () => {
      expect(certificateTotalsRows(certificateImport)).toEqual([])
    })
  })

  describe('certificateChangeText', () => {
    const row = {
      locationKey: 'TST-A-1-002',
      status: 'SKIPPED',
      maxCapacity: 2,
      workingCapacity: 2,
      certifiedNormalAccommodation: 2,
    } as const

    it('shows a certified value that changes even when Residential locations does not', () => {
      expect(
        certificateChangeText(
          {
            ...row,
            currentCertifiedMaxCapacity: 2,
            currentCertifiedWorkingCapacity: 1,
            currentCertifiedNormalAccommodation: 2,
          },
          true,
        ),
      ).toEqual('Certificate: working capacity 1 → 2')
    })

    it('lists every value that changes', () => {
      expect(
        certificateChangeText(
          {
            ...row,
            currentCertifiedMaxCapacity: 3,
            currentCertifiedWorkingCapacity: 1,
            currentCertifiedNormalAccommodation: 1,
          },
          true,
        ),
      ).toEqual('Certificate: max capacity 3 → 2, working capacity 1 → 2, CNA 1 → 2')
    })

    it('says nothing when the certificate does not change', () => {
      expect(
        certificateChangeText(
          {
            ...row,
            currentCertifiedMaxCapacity: 2,
            currentCertifiedWorkingCapacity: 2,
            currentCertifiedNormalAccommodation: 2,
          },
          true,
        ),
      ).toBeUndefined()
    })

    it('calls a cell new to the certificate only when the import recorded the current certificate', () => {
      expect(certificateChangeText(row, true)).toEqual('New to the certificate')
      // an import made before these values were recorded, or a prison with no certificate
      expect(certificateChangeText(row, false)).toBeUndefined()
    })

    it('says nothing for a failed row or an archived location, which put nothing on the certificate', () => {
      expect(certificateChangeText({ ...row, status: 'FAILED' }, true)).toBeUndefined()
      expect(certificateChangeText({ ...row, message: 'Archived location' }, true)).toBeUndefined()
    })
  })

  it('orders rows: needing review, added, certificate changes, failed, then the rest', async () => {
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({
      ...certificateImport,
      carriedForwardRecords: 1,
      notOnCertificateRecords: 2,
      locations: [
        {
          locationKey: 'TST-A-1-010',
          status: 'SKIPPED',
          maxCapacity: 2,
          workingCapacity: 2,
          currentCertifiedMaxCapacity: 2,
          currentCertifiedWorkingCapacity: 2,
          currentCertifiedNormalAccommodation: 2,
          certifiedNormalAccommodation: 2,
        },
        { locationKey: 'TST-A-1-011', status: 'FAILED', maxCapacity: 2, workingCapacity: 2 },
        {
          locationKey: 'TST-A-1-012',
          status: 'SKIPPED',
          maxCapacity: 2,
          workingCapacity: 2,
          currentCertifiedMaxCapacity: 2,
          currentCertifiedWorkingCapacity: 1,
          currentCertifiedNormalAccommodation: 2,
          certifiedNormalAccommodation: 2,
        },
        {
          locationKey: 'TST-A-1-013',
          status: 'SKIPPED',
          maxCapacity: 2,
          workingCapacity: 1,
          workingCapacityMismatch: true,
          currentCertifiedMaxCapacity: 2,
          currentCertifiedWorkingCapacity: 1,
          currentCertifiedNormalAccommodation: 2,
          certifiedNormalAccommodation: 2,
        },
      ],
      locationsNotOnCertificate: [
        {
          locationKey: 'TST-A-1-020',
          onCurrentCertificate: true,
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 2,
        },
        {
          locationKey: 'TST-A-1-021',
          onCurrentCertificate: false,
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 2,
        },
      ],
    })

    await importDetail(deepReq as Request, deepRes as Response)

    const locals = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(locals.locationRows.map((r: { locationKey: string }) => r.locationKey)).toEqual([
      'TST-A-1-013', // needs review
      'TST-A-1-021', // added
      'TST-A-1-012', // certificate: working capacity 1 -> 2
      'TST-A-1-011', // failed
      'TST-A-1-010', // unchanged
      'TST-A-1-020', // carried forward
    ])
    expect(locals).toEqual(expect.objectContaining({ carriedForwardRecords: 1, addedRecords: 1 }))
  })

  it('points a mistyped name and the cell it most likely meant at each other', async () => {
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue({
      ...certificateImport,
      notOnCertificateRecords: 1,
      locations: [
        {
          locationKey: 'TST-B-1-5',
          status: 'FAILED',
          message: 'Location not found on Residential locations',
          maxCapacity: 2,
          workingCapacity: 2,
          suggestedLocationKey: 'TST-B-1-005',
        },
      ],
      locationsNotOnCertificate: [{ locationKey: 'TST-B-1-005', maxCapacity: 2, uploadedAsKey: 'TST-B-1-5' }],
    })

    await importDetail(deepReq as Request, deepRes as Response)

    const { locationRows } = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(locationRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locationKey: 'TST-B-1-5', suggestion: 'Did you mean TST-B-1-005?' }),
        expect.objectContaining({ locationKey: 'TST-B-1-005', suggestion: 'Possibly listed in the file as TST-B-1-5' }),
      ]),
    )
  })

  it('makes no suggestion when the API has none', async () => {
    locationsService.getCellCertificateImport = jest.fn().mockResolvedValue(certificateImport)

    await importDetail(deepReq as Request, deepRes as Response)

    const { locationRows } = (deepRes.render as jest.Mock).mock.calls[0][1]
    expect(locationRows.every((row: { suggestion?: string }) => row.suggestion === undefined)).toBe(true)
  })
})
