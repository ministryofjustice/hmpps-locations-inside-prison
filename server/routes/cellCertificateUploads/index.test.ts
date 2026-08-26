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
  locationsService.getCellCertificateUploads.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('viewing cell certificate uploads', () => {
  // Only the roles that can run an ingestion reach these pages at all.
  it.each([['MANAGE_RES_LOCATIONS_ADMIN'], ['RESI__CERT_VIEWER']])('is allowed for %s', async role => {
    await request(buildApp([role]))
      .get(paths.prison.cellCertificateUploads('TST'))
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
      .get(paths.prison.cellCertificateUploads('TST'))
      .expect(302)
      .expect('Location', paths.auth.signOut)
  })
})

describe('starting a new cell certificate upload', () => {
  it.each([['MANAGE_RES_LOCATIONS_ADMIN'], ['RESI__CERT_VIEWER']])('is allowed for %s', async role => {
    await request(buildApp([role]))
      .get(`${paths.prison.cellCertificateUploads('TST')}/new`)
      .expect(302)
      .expect('Location', `${paths.prison.cellCertificateUploads('TST')}/new/upload`)
  })

  it.each([['MANAGE_RESIDENTIAL_LOCATIONS'], ['MANAGE_RES_LOCATIONS_OP_CAP']])('is refused for %s', async role => {
    await request(buildApp([role]))
      .get(`${paths.prison.cellCertificateUploads('TST')}/new`)
      .expect(302)
      .expect('Location', paths.auth.signOut)
  })
})
