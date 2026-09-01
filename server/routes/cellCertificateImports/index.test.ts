import type { Express } from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService, { Page } from '../../services/auditService'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import PrisonService from '../../services/prisonService'
import ManageUsersService from '../../services/manageUsersService'
import paths from '../../utils/paths'

jest.mock('../../services/auditService')
jest.mock('../../services/authService')
jest.mock('../../services/locationsService')
jest.mock('../../services/prisonService')
jest.mock('../../services/manageUsersService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const authService = new AuthService(null) as jest.Mocked<AuthService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>
const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>

const buildApp = (userRoles: string[]): Express =>
  appWithAllRoutes({
    services: { auditService, authService, locationsService, prisonService, manageUsersService },
    userSupplier: () => ({ ...user, userRoles }),
  })

beforeEach(() => {
  authService.getSystemClientToken.mockResolvedValue('token')
  manageUsersService.getCaseloads.mockResolvedValue([{ id: 'TST', name: 'Test' }])
  auditService.logPageView.mockResolvedValue(null)
  locationsService.getPrisonConfiguration.mockResolvedValue({
    prisonId: 'TST',
    resiLocationServiceActive: 'ACTIVE',
    nonResiServiceActive: 'ACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
    certificationApprovalRequired: 'ACTIVE',
  })
  locationsService.getCellCertificateImports.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('viewing cell certificate imports', () => {
  // Only the roles that can run an import reach these pages at all.
  it.each([['MANAGE_RES_LOCATIONS_ADMIN'], ['RESI__CERT_VIEWER']])('is allowed for %s', async role => {
    await request(buildApp([role]))
      .get(paths.prison.cellCertificateImports('TST'))
      .expect(200)
      .expect('Content-Type', /html/)

    expect(auditService.logPageView).toHaveBeenCalledWith(Page.CELL_CERTIFICATE_UPLOADS, {
      who: user.username,
      correlationId: expect.any(String),
    })
  })

  // A missing permission signs the user out rather than rendering a 403 page - see server/errorHandler.ts.
  it.each([
    ['VIEW_INTERNAL_LOCATION'],
    ['MANAGE_RESIDENTIAL_LOCATIONS'],
    ['MANAGE_RES_LOCATIONS_OP_CAP'],
    ['RESI__CERT_REVIEWER'],
    ['SOME_OTHER_ROLE'],
  ])('is refused for %s', async role => {
    await request(buildApp([role]))
      .get(paths.prison.cellCertificateImports('TST'))
      .expect(302)
      .expect('Location', paths.auth.signOut)
  })
})

// The templates read `imports` / `certificateImport` from the locals; Nunjucks renders a mistyped name
// as nothing rather than failing, so render the populated branches rather than only the empty ones.
describe('rendering an import', () => {
  const finishedImport = {
    id: 'import-1',
    prisonId: 'TST',
    status: 'FINISHED' as const,
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
        status: 'PROCESSED' as const,
        maxCapacity: 2,
        workingCapacity: 1,
        previousWorkingCapacity: 2,
        workingCapacityMismatch: true,
      },
    ],
  }

  it('lists each import, linking to its report', async () => {
    locationsService.getCellCertificateImports.mockResolvedValue([finishedImport])

    const response = await request(buildApp(['MANAGE_RES_LOCATIONS_ADMIN']))
      .get(paths.prison.cellCertificateImports('TST'))
      .expect(200)

    expect(response.text).toContain(`${paths.prison.cellCertificateImports('TST')}/import/import-1`)
    expect(response.text).toContain('Complete')
  })

  it('shows the summary and cells on the report', async () => {
    locationsService.getCellCertificateImport.mockResolvedValue(finishedImport)

    const response = await request(buildApp(['MANAGE_RES_LOCATIONS_ADMIN']))
      .get(`${paths.prison.cellCertificateImports('TST')}/import/import-1`)
      .expect(200)

    expect(response.text).toContain('USER1')
    expect(response.text).toContain('TST-A-1-001')
    expect(response.text).toContain('Certified 1')
  })
})

describe('starting a new cell certificate import', () => {
  it.each([['MANAGE_RES_LOCATIONS_ADMIN'], ['RESI__CERT_VIEWER']])('is allowed for %s', async role => {
    await request(buildApp([role]))
      .get(`${paths.prison.cellCertificateImports('TST')}/new`)
      .expect(302)
      .expect('Location', `${paths.prison.cellCertificateImports('TST')}/new/upload`)
  })

  it.each([['MANAGE_RESIDENTIAL_LOCATIONS'], ['MANAGE_RES_LOCATIONS_OP_CAP']])('is refused for %s', async role => {
    await request(buildApp([role]))
      .get(`${paths.prison.cellCertificateImports('TST')}/new`)
      .expect(302)
      .expect('Location', paths.auth.signOut)
  })
})
