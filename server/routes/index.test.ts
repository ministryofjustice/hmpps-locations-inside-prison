import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService, { Page } from '../services/auditService'

jest.mock('../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    auditService.logPageView.mockResolvedValue(null)

    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        // Check that breadcrumbs are present
        expect(res.text).toContain('govuk-breadcrumbs')

        // Test the tiles
        expect(res.text).toContain('View and update locations')
        expect(res.text).toContain('View all inactive cells')
        expect(res.text).toContain('Archived locations')

        expect(auditService.logPageView).toHaveBeenCalledWith(Page.INDEX, {
          who: user.username,
          correlationId: expect.any(String),
        })
      })
  })
})
