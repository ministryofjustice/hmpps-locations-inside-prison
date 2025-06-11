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
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /manage-locations', () => {
  it('should redirect to /manage-locations/PRISON_ID', () => {
    auditService.logPageView.mockResolvedValue(null)

    return request(app).get('/manage-locations').expect(302).expect('Location', '/manage-locations/TST')
  })
})

describe('GET /manage-locations/PRISON_ID', () => {
  it('should render the manage location index page', async () => {
    auditService.logPageView.mockResolvedValue(null)
    locationsService.getAccommodationType.mockResolvedValue('Test Description')
    locationsService.getUsedForType.mockResolvedValue('Test Description')
    locationsService.getResidentialSummary.mockResolvedValue({
      topLevelLocationType: 'Wings',
      locationHierarchy: [],
      prisonSummary: {
        workingCapacity: 85,
        signedOperationalCapacity: 90,
        maxCapacity: 95,
      },
      subLocationName: 'Test Wing',
      subLocations: [],
    })

    const res = await request(app).get('/manage-locations/TST').expect(200)

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).toMatch(/>\s+85\s+</)
    expect(res.text).toMatch(/>\s+90\s+</)
    expect(res.text).toMatch(/>\s+95\s+</)

    expect(auditService.logPageView).toHaveBeenCalledWith(Page.LOCATION_CREATE, {
      who: user.username,
      correlationId: expect.any(String),
    })
  })
})
