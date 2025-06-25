import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, manageUser, user } from './testutils/appSetup'
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

describe('GET / with view and update locations tile', () => {
  beforeEach(() => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: false,
      includeSegregationInRollCount: false,
      certificationApprovalRequired: false,
    })

    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
      },
      userSupplier: () => user,
    })
  })

  it('should render index page', async () => {
    auditService.logPageView.mockResolvedValue(null)

    const res = await request(app).get('/')
    expect(res.text).not.toContain('Manage locations')

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).toContain('View and update locations')
    expect(res.text).toContain('View all inactive cells')
    expect(res.text).toContain('Archived locations')

    expect(auditService.logPageView).toHaveBeenCalledWith(Page.INDEX, {
      who: user.username,
      correlationId: expect.any(String),
    })
  })
})

describe('GET / with manage locations tile', () => {
  beforeEach(() => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: false,
      includeSegregationInRollCount: false,
      certificationApprovalRequired: true,
    })
    app = appWithAllRoutes({
      services: {
        auditService,
        locationsService,
      },
      userSupplier: () => manageUser,
    })
  })

  it('should render index page', async () => {
    auditService.logPageView.mockResolvedValue(null)

    const res = await request(app).get('/')
    expect(res.text).toContain('Manage locations')

    expect(res.text).toContain('govuk-breadcrumbs')
    expect(res.text).not.toContain('View and update locations')
    expect(res.text).toContain('View all inactive cells')
    expect(res.text).toContain('Archived locations')

    expect(auditService.logPageView).toHaveBeenCalledWith(Page.INDEX, {
      who: manageUser.username,
      correlationId: expect.any(String),
    })
  })
})
