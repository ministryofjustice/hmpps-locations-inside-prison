import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService from '../services/auditService'
import AuthService from '../services/authService'
import LocationsService from '../services/locationsService'
import { HmppsUser } from '../interfaces/hmppsUser'

jest.mock('../services/auditService')
jest.mock('../services/authService')
jest.mock('../services/locationsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const authService = new AuthService(null) as jest.Mocked<AuthService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

const certificateViewer: HmppsUser = {
  ...user,
  userRoles: ['RESI__CERT_VIEWER'],
}

let app: Express

const buildApp = (userSupplier: () => HmppsUser) =>
  appWithAllRoutes({
    services: {
      auditService,
      authService,
      locationsService,
    },
    userSupplier,
  })

beforeEach(() => {
  auditService.logPageView.mockResolvedValue(null)
  locationsService.getPrisonConfiguration.mockResolvedValue({
    prisonId: 'TST',
    resiLocationServiceActive: 'INACTIVE',
    nonResiServiceActive: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
    certificationApprovalRequired: 'INACTIVE',
  })
  locationsService.getCellCertificateDashboard.mockResolvedValue([
    {
      prisonId: 'TST',
      prisonName: 'Test (HMP)',
      certifiedWorkingCapacity: 100,
      signedOperationCapacity: 95,
      pendingChangeRequests: 0,
      certificateLastUpdated: '2025-02-02T12:00:00',
    },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /capacity-management-dashboard', () => {
  it('renders the dashboard for a certificate viewer', () => {
    app = buildApp(() => certificateViewer)

    return request(app)
      .get('/capacity-management-dashboard')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Capacity management dashboard')
        expect(res.text).toContain('capacity-management-dashboard-table')
        expect(res.text).toContain('Test (HMP)')
      })
  })

  it('denies access to a user without the certificate viewer permission', () => {
    app = buildApp(() => user)

    // protectRoute raises a "Missing permission" 403, which the error handler turns into a sign-out redirect
    return request(app).get('/capacity-management-dashboard').expect(302).expect('Location', '/sign-out')
  })
})
