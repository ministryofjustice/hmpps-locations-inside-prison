import type { Express, Request, Response } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import createErrorHandler from './errorHandler'
import AnalyticsService from './services/analyticsService'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with this service')
        expect(res.text).toContain('NotFoundError: Not Found')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with this service')
        expect(res.text).not.toContain('NotFoundError: Not Found')
      })
  })
})

describe('error handler', () => {
  const errorHandler = createErrorHandler(true)
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const req = {
    originalUrl: '/location/7e570000-0000-0000-0000-000000000001/change-cell-capacity/confirm',
    services: {
      analyticsService,
    },
  } as unknown as Request
  const res = {
    locals: {
      user: {
        activeCaseload: {
          id: 'TST',
        },
        username: 'NSCAMANDER',
      },
    },
  } as Response

  beforeEach(() => {
    analyticsService.sendEvent = jest.fn()
    res.render = jest.fn()
    res.status = jest.fn()
  })

  it('should send an API error event to Google Analytics', () => {
    const error: any = new Error('API error')
    error.data = { errorCode: 117, status: 400 }

    errorHandler(error, req, res, undefined)

    expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'unhandled_error', {
      prison_id: 'TST',
      error_code: 117,
    })
  })

  it('should send an unknown error event to Google Analytics', () => {
    const error: any = new Error('API error')

    errorHandler(error, req, res, undefined)

    expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'unhandled_error', {
      prison_id: 'TST',
      error_code: undefined,
    })
  })
})
