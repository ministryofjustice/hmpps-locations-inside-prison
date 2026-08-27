import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import importList from './list'
import LocationsService from '../../services/locationsService'
import { CellCertificateImport } from '../../data/types/locationsApi/cellCertificateImport'
import paths from '../../utils/paths'

describe('Cell certificate imports - list', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const finishedImport = {
    id: 'import-1',
    prisonId: 'TST',
    status: 'FINISHED',
    totalRecords: 3,
    processedRecords: 2,
    skippedRecords: 1,
    failedRecords: 0,
    requestedBy: 'USER1',
    requestedDate: '2024-01-01T10:00:00',
  } as CellCertificateImport

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

  it('renders the imports list with hasInProgress false when all are finished', async () => {
    locationsService.getCellCertificateImports = jest.fn().mockResolvedValue([finishedImport])

    await importList(deepReq as Request, deepRes as Response)

    expect(locationsService.getCellCertificateImports).toHaveBeenCalledWith('token', 'TST')
    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/list',
      expect.objectContaining({
        imports: [finishedImport],
        hasInProgress: false,
        newImportUrl: `${paths.prison.cellCertificateImports('TST')}/new`,
      }),
    )
  })

  it('sets hasInProgress true when an import is pending or started', async () => {
    locationsService.getCellCertificateImports = jest
      .fn()
      .mockResolvedValue([finishedImport, { ...finishedImport, id: 'import-2', status: 'STARTED' }])

    await importList(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/list',
      expect.objectContaining({ hasInProgress: true }),
    )
  })

  it('surfaces a flashed error as a validation error', async () => {
    locationsService.getCellCertificateImports = jest.fn().mockResolvedValue([])
    deepReq.flash = jest
      .fn()
      .mockImplementation((key: string) =>
        key === 'error' ? [{ title: 'There is a problem', content: 'Import already running' }] : [],
      )

    await importList(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith(
      'pages/cellCertificateImports/list',
      expect.objectContaining({ validationErrors: [{ text: 'Import already running', href: '#' }] }),
    )
  })
})
