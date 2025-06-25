import type { Express, Request, Response } from 'express'
import request from 'supertest'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { DeepPartial } from 'fishery'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import createErrorHandler from './errorHandler'
import AnalyticsService from './services/analyticsService'
import LocationsService from './services/locationsService'

jest.mock('./services/locationsService')

let app: Express

const MockedLocationsService = LocationsService as jest.MockedClass<typeof LocationsService>
let locationsService: jest.Mocked<LocationsService>

beforeEach(() => {
  locationsService = new MockedLocationsService(null) as unknown as jest.Mocked<LocationsService>
  app = appWithAllRoutes({ services: { locationsService: locationsService as unknown as LocationsService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('error handler', () => {
  const errorHandler = createErrorHandler(true)
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const deepReq: DeepPartial<Request> = {
    originalUrl: '/location/7e570000-0000-0000-0000-000000000001/change-cell-capacity/confirm',
    services: {
      analyticsService,
    },
  }
  const req = deepReq as Request
  const deepRes: DeepPartial<Response> = {
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
  }
  const res = deepRes as Response
  let error: SanitisedError<object>

  beforeEach(() => {
    locationsService.getPrisonConfiguration.mockResolvedValue({
      prisonId: 'TST',
      resiLocationServiceActive: false,
      includeSegregationInRollCount: false,
      certificationApprovalRequired: true,
    })

    analyticsService.sendEvent = jest.fn()
    res.render = jest.fn()
    res.status = jest.fn()
    error = new Error('API error')
    error.responseStatus = 500
  })

  describe('GET 404', () => {
    it('should render content with stack in dev mode', () => {
      return request(app)
        .get('/unknown')
        .expect(404)
        .expect('Content-Type', /html/)
        .expect(r => {
          expect(r.text).toContain('Page not found')
          expect(r.text).toContain('NotFoundError: Not Found')
        })
    })

    it('should render content without stack in production mode', () => {
      return request(
        appWithAllRoutes({
          production: true,
          services: {
            locationsService: locationsService as unknown as LocationsService,
          },
        }),
      )
        .get('/unknown')
        .expect(404)
        .expect('Content-Type', /html/)
        .expect(r => {
          expect(r.text).toContain('Page not found')
          expect(r.text).not.toContain('NotFoundError: Not Found')
        })
    })
  })

  it('should send an API error event to Google Analytics', () => {
    error.data = { errorCode: 117, status: 400 }

    errorHandler(error, req as Request, res, undefined)

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

  describe('GET 401', () => {
    beforeEach(() => {
      error.responseStatus = 401
    })

    describe('when error.headers signifies that the JWT is invalid', () => {
      beforeEach(() => {
        ;(error as SanitisedError).headers = {
          'www-authenticate':
            'Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Jwt expired at 2025-05-21T13:39:21Z", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"',
        }
      })

      it('logs the user out', () => {
        errorHandler(error, req, res, undefined)

        expect(res.redirect).toHaveBeenCalledWith('/sign-out')
      })
    })

    describe('when error.message specifies invalid permissions', () => {
      beforeEach(() => {
        error.message = 'Missing permission'
      })

      it('logs the user out', () => {
        errorHandler(error, req, res, undefined)

        expect(res.redirect).toHaveBeenCalledWith('/sign-out')
      })
    })

    describe('when error.headers does not signify that the JWT is invalid', () => {
      it('renders the generic error page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/generic')
      })
    })
  })

  describe('GET 403', () => {
    beforeEach(() => {
      error.responseStatus = 403
    })

    describe('when error.headers signifies that the JWT is invalid', () => {
      beforeEach(() => {
        ;(error as SanitisedError).headers = {
          'www-authenticate':
            'Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Jwt expired at 2025-05-21T13:39:21Z", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"',
        }
      })

      it('logs the user out', () => {
        errorHandler(error, req, res, undefined)

        expect(res.redirect).toHaveBeenCalledWith('/sign-out')
      })
    })

    describe('when error.message specifies invalid permissions', () => {
      beforeEach(() => {
        error.message = 'Missing permission'
      })

      it('logs the user out', () => {
        errorHandler(error, req, res, undefined)

        expect(res.redirect).toHaveBeenCalledWith('/sign-out')
      })
    })

    describe('when error.headers does not signify that the JWT is invalid', () => {
      it('renders the generic error page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/generic')
      })
    })
  })

  describe('GET 456', () => {
    beforeEach(() => {
      error.responseStatus = 456
    })

    describe('when error.headers signifies that the JWT is invalid', () => {
      beforeEach(() => {
        ;(error as SanitisedError).headers = {
          'www-authenticate':
            'Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Jwt expired at 2025-05-21T13:39:21Z", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"',
        }
      })

      it('renders the generic error page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/generic')
      })
    })

    describe('when error.headers does not signify that the JWT is invalid', () => {
      it('renders the generic error page', () => {
        errorHandler(error, req, res, undefined)

        expect(res.render).toHaveBeenCalledWith('pages/errors/generic')
      })
    })
  })
})
