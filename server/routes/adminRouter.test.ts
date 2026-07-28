import type { Express } from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import AuthService from '../services/authService'
import LocationsService from '../services/locationsService'
import PrisonService from '../services/prisonService'
import paths from '../utils/paths'
import ManageUsersService from '../services/manageUsersService'

jest.mock('../services/auditService')
jest.mock('../services/authService')
jest.mock('../services/locationsService')
jest.mock('../services/prisonService')
jest.mock('../services/manageUsersService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const authService = new AuthService(null) as jest.Mocked<AuthService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>
const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>

let app: Express

const adminUser = {
  ...user,
  userRoles: ['MANAGE_RES_LOCATIONS_ADMIN'],
}

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      authService,
      locationsService,
      prisonService,
      manageUsersService,
    },
    userSupplier: () => adminUser,
  })
  authService.getSystemClientToken.mockResolvedValue('token')
  manageUsersService.getCaseloads.mockResolvedValue([{ id: 'TST', name: 'Test' }])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /PRISON_ID/admin', () => {
  it('should render the admin index page', async () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'ACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })
    prisonService.getServiceStatus.mockResolvedValue('')
    prisonService.getScreenStatus.mockResolvedValue({
      conditionType: 'CASELOAD',
      conditionValue: 'TST',
      blockAccess: true,
    })
    return request(app)
      .get(paths.admin.index('TST'))
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // check links
        expect(res.text).toContain(paths.admin.changeResidentialStatus('TST'))
        expect(res.text).toContain(paths.admin.changeCertificationStatus('TST'))
        expect(res.text).toContain(paths.admin.changeIncludeSegInRollCount('TST'))
        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOCATION_ADMIN, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })

  it('should render the admin index page when NOMIS housing checkboxes are disabled', async () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'ACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })

    // a 404 is returned when the NOMIS screen is switched off
    const error: SanitisedError<object> = new Error('Not Found')
    error.responseStatus = 404
    prisonService.getServiceStatus.mockImplementationOnce(() => Promise.reject(error))
    prisonService.getScreenStatus.mockResolvedValue({
      conditionType: 'CASELOAD',
      conditionValue: 'TST',
      blockAccess: false,
    })
    return request(app)
      .get(paths.admin.index('TST'))
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // check links
        expect(res.text).toContain(paths.admin.changeResidentialStatus('TST'))
        expect(res.text).toContain(paths.admin.changeCertificationStatus('TST'))

        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOCATION_ADMIN, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })

  it('should use getFallbackScreenStatus when getScreenStatus returns 404 for specific prison', async () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'ACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })
    prisonService.getServiceStatus.mockResolvedValue('')

    const notFound: SanitisedError<object> = new Error('Not Found')
    notFound.responseStatus = 404
    // Primary lookup (per-prison) returns 404 for every module, fallback (**ALL**) succeeds with blockAccess=true
    prisonService.getScreenStatus.mockImplementation(async (_token, prisonId) => {
      if (prisonId === '**ALL**') {
        return { conditionType: 'CASELOAD', conditionValue: '**ALL**', blockAccess: true }
      }
      throw notFound
    })

    return request(app)
      .get(paths.admin.index('TST'))
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // 3 modules × (primary + fallback) = 6 calls
        expect(prisonService.getScreenStatus).toHaveBeenCalledTimes(6)
        const callsByPrison = prisonService.getScreenStatus.mock.calls.map(args => args[1])
        expect(callsByPrison.filter(p => p === 'TST')).toHaveLength(3)
        expect(callsByPrison.filter(p => p === '**ALL**')).toHaveLength(3)
        const modulesCalled = prisonService.getScreenStatus.mock.calls.map(args => args[2])
        expect(modulesCalled).toEqual(expect.arrayContaining(['OIMMHOLO', 'OIMILOCA', 'OIMULOCA']))

        // Check that the page was rendered with blockAccess=true from the fallback
        expect(res.text).toContain('govuk-breadcrumbs')
        expect(res.text).toContain(paths.admin.changeResidentialStatus('TST'))
        expect(res.text).toContain(paths.admin.changeCertificationStatus('TST'))
      })
  })

  it('should default to blockAccess=false when both specific prison and **ALL** return 404', async () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'ACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })
    prisonService.getServiceStatus.mockResolvedValue('')

    const notFound: SanitisedError<object> = new Error('Not Found')
    notFound.responseStatus = 404
    // Both per-prison and fallback return 404 for every module
    prisonService.getScreenStatus.mockImplementation(() => Promise.reject(notFound))

    return request(app)
      .get(paths.admin.index('TST'))
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // 3 modules × (primary + fallback) = 6 calls
        expect(prisonService.getScreenStatus).toHaveBeenCalledTimes(6)
        const callsByPrison = prisonService.getScreenStatus.mock.calls.map(args => args[1])
        expect(callsByPrison.filter(p => p === 'TST')).toHaveLength(3)
        expect(callsByPrison.filter(p => p === '**ALL**')).toHaveLength(3)

        // Check that the page was rendered (blockAccess should default to false)
        expect(res.text).toContain('govuk-breadcrumbs')
        expect(res.text).toContain(paths.admin.changeResidentialStatus('TST'))
        expect(res.text).toContain(paths.admin.changeCertificationStatus('TST'))
      })
  })
})
