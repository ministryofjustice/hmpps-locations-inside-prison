import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import AuthService from '../services/authService'
import LocationsService from '../services/locationsService'

jest.mock('../services/auditService')
jest.mock('../services/authService')
jest.mock('../services/locationsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const authService = new AuthService(null) as jest.Mocked<AuthService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      authService,
      locationsService,
    },
    userSupplier: () => user,
  })
  authService.getSystemClientToken.mockResolvedValue('token')
  locationsService.getPrisonConfiguration.mockResolvedValue({
    prisonId: 'TST',
    resiLocationServiceActive: 'INACTIVE',
    nonResiServiceActive: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
    certificationApprovalRequired: 'INACTIVE',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view-and-update-locations', () => {
  it('should redirect to /view-and-update-locations/PRISON_ID', () => {
    auditService.logPageView.mockResolvedValue(null)

    return request(app)
      .get('/view-and-update-locations')
      .expect(302)
      .expect('Location', '/view-and-update-locations/TST')
  })
})

describe('GET /view-and-update-locations/PRISON_ID', () => {
  it('should render index page', () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getAccommodationType.mockResolvedValue('Test Description')
    locationsService.getUsedForType.mockResolvedValue('Test Description')
    locationsService.getResidentialSummary.mockResolvedValue({
      topLevelLocationType: 'Wings',
      locationHierarchy: [],
      prisonSummary: {
        prisonName: 'Test (HMP)',
        workingCapacity: 95,
        signedOperationalCapacity: 102,
        maxCapacity: 100,
        numberOfCellLocations: 73,
      },
      subLocationName: 'TestWings',
      subLocations: [],
    })

    return request(app)
      .get('/view-and-update-locations/TST')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // Check that capacity values are present
        expect(res.text).toMatch(/>\s+95\s+</)
        expect(res.text).toMatch(/>\s+102\s+</)
        expect(res.text).toMatch(/>\s+100\s+</)

        expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOCATIONS_INDEX, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })
})
