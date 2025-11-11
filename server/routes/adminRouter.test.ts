import type { Express } from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import AuthService from '../services/authService'
import LocationsService from '../services/locationsService'
import PrisonService from '../services/prisonService'

jest.mock('../services/auditService')
jest.mock('../services/authService')
jest.mock('../services/locationsService')
jest.mock('../services/prisonService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const authService = new AuthService(null) as jest.Mocked<AuthService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
const prisonService = new PrisonService(null) as jest.Mocked<PrisonService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      authService,
      locationsService,
      prisonService,
    },
    userSupplier: () => user,
  })
  authService.getSystemClientToken.mockResolvedValue('token')
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /admin', () => {
  it('should redirect to /admin/PRISON_ID', () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'ACTIVE',
      nonResiServiceActive: 'ACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })

    return request(app).get('/admin').expect(302).expect('Location', '/admin/TST')
  })
})

describe('GET /admin/PRISON_ID', () => {
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
      .get('/admin/TST')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // check links
        expect(res.text).toContain('/admin/TST/change-resi-status')
        expect(res.text).toContain('/admin/TST/change-certification-status')
        expect(res.text).toContain('/admin/TST/change-include-seg-in-roll-count')
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
      .get('/admin/TST')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // check links
        expect(res.text).toContain('/admin/TST/change-resi-status')
        expect(res.text).toContain('/admin/TST/change-certification-status')

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

    // First call to getScreenStatus fails with 404
    const error: SanitisedError<object> = new Error('Not Found')
    error.responseStatus = 404
    prisonService.getScreenStatus.mockImplementationOnce(() => Promise.reject(error))

    // Second call to getScreenStatus (with **ALL**) succeeds
    prisonService.getScreenStatus.mockImplementationOnce(() =>
      Promise.resolve({
        conditionType: 'CASELOAD',
        conditionValue: '**ALL**',
        blockAccess: true,
      }),
    )

    return request(app)
      .get('/admin/TST')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that getScreenStatus was called twice
        // First with 'TST', then with '**ALL**'
        expect(prisonService.getScreenStatus).toHaveBeenCalledTimes(2)
        expect(prisonService.getScreenStatus.mock.calls[0][1]).toBe('TST')
        expect(prisonService.getScreenStatus.mock.calls[1][1]).toBe('**ALL**')

        // Check that the page was rendered with blockAccess=true from the fallback
        expect(res.text).toContain('govuk-breadcrumbs')
        expect(res.text).toContain('/admin/TST/change-resi-status')
        expect(res.text).toContain('/admin/TST/change-certification-status')
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

    // Create a 404 error
    const error: SanitisedError<object> = new Error('Not Found')
    error.responseStatus = 404

    // First call to getScreenStatus fails with 404
    prisonService.getScreenStatus.mockImplementationOnce(() => Promise.reject(error))

    // Second call to getScreenStatus (with **ALL**) also fails with 404
    prisonService.getScreenStatus.mockImplementationOnce(() => Promise.reject(error))

    return request(app)
      .get('/admin/TST')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that getScreenStatus was called twice
        // First with 'TST', then with '**ALL**'
        expect(prisonService.getScreenStatus).toHaveBeenCalledTimes(2)
        expect(prisonService.getScreenStatus.mock.calls[0][1]).toBe('TST')
        expect(prisonService.getScreenStatus.mock.calls[1][1]).toBe('**ALL**')

        // Check that the page was rendered (blockAccess should default to false)
        expect(res.text).toContain('govuk-breadcrumbs')
        expect(res.text).toContain('/admin/TST/change-resi-status')
        expect(res.text).toContain('/admin/TST/change-certification-status')
      })
  })
})
