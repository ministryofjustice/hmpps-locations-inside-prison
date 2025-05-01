import type { Express, Request, Response } from 'express'
import request from 'supertest'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
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
        expect(res.text).toContain('Page not found')
        expect(res.text).toContain('NotFoundError: Not Found')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
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
    redirect: jest.fn(),
    render: jest.fn(),
  } as unknown as Response
  let error: SanitisedError<object>

  beforeEach(() => {
    analyticsService.sendEvent = jest.fn()
    res.render = jest.fn()
    res.status = jest.fn()
    error = new Error('API error')
    error.responseStatus = 500
  })

  it('should send an API error event to Google Analytics', () => {
    error.data = { errorCode: 117, status: 400 }

    errorHandler(error, req, res, undefined)

    expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'unhandled_error', {
      prison_id: 'TST',
      error_code: 117,
    })
  })

  it('should send an unknown error event to Google Analytics', () => {
    errorHandler(error, req, res, undefined)

    expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'unhandled_error', {
      prison_id: 'TST',
      error_code: undefined,
    })
  })

  describe('when the error is an api error', () => {
    beforeEach(() => {
      ;(error as any).isApiError = true
    })

    describe('when the error is 401', () => {
      beforeEach(() => {
        error.responseStatus = 401
      })

      it('renders the generic error page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/generic')
      })
    })

    describe('when the error is 403', () => {
      beforeEach(() => {
        error.responseStatus = 403
      })

      it('renders the generic error page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/generic')
      })
    })

    describe('when the error is 404', () => {
      beforeEach(() => {
        error.responseStatus = 404
      })

      it('renders the 404 page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/404')
      })
    })
  })

  describe('when the error is not an api error', () => {
    describe('when the error is 401', () => {
      beforeEach(() => {
        error.responseStatus = 401
      })

      it('logs the user out', () => {
        errorHandler(error, req, res, undefined)

        expect(res.redirect).toHaveBeenCalledWith('/sign-out')
      })
    })

    describe('when the error is 403', () => {
      beforeEach(() => {
        error.responseStatus = 403
      })

      it('logs the user out', () => {
        errorHandler(error, req, res, undefined)

        expect(res.redirect).toHaveBeenCalledWith('/sign-out')
      })
    })

    describe('when the error is 404', () => {
      beforeEach(() => {
        error.responseStatus = 404
      })

      it('renders the 404 page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/404')
      })
    })
  })
})
