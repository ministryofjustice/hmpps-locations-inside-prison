import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'
import LocationsService from '../services/locationsService'

jest.mock('../services/auditService')
jest.mock('../services/locationsService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      locationsService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page with "View and update locations" when certificationApprovalRequired is INACTIVE', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'INACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
      },
      userSupplier: () => user,
    })

    auditService.logPageView.mockResolvedValue(null)
    const res = await request(app).get('/')

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).toContain('View and update locations')
    expect(res.text).toContain('View all inactive cells')
    expect(res.text).toContain('Archived locations')

    expect(res.text).not.toContain('Manage locations')
    expect(res.text).not.toContain('Cell certificate')

    expect(auditService.logPageView).toHaveBeenCalledWith(Page.INDEX, {
      who: user.username,
      correlationId: expect.any(String),
    })
  })

  it('should render index page with "View and update locations" when certificationApprovalRequired is INACTIVE', async () => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: 'INACTIVE',
      includeSegregationInRollCount: 'INACTIVE',
      certificationApprovalRequired: 'ACTIVE',
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
      },
      userSupplier: () => user,
    })

    auditService.logPageView.mockResolvedValue(null)
    const res = await request(app).get('/')

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).toContain('Manage locations')
    expect(res.text).toContain('View all inactive cells')
    expect(res.text).toContain('Archived locations')
    expect(res.text).toContain('Cell certificate')

    expect(res.text).not.toContain('View and update locations')

    expect(auditService.logPageView).toHaveBeenCalledWith(Page.INDEX, {
      who: user.username,
      correlationId: expect.any(String),
    })
  })
})
