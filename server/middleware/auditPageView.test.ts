import express from 'express'
import request from 'supertest'

import { AuditService } from '@ministryofjustice/hmpps-audit-client'

import auditPageView from './auditPageView'

jest.mock('@ministryofjustice/hmpps-audit-client')

let auditService: jest.Mocked<AuditService>

const renderedHtml = '<html lang="en">page</html>'

/**
 * Minimal app mirroring app.ts’ ordering: user first, then the audit middleware, then routes.
 *
 * `res.render` is stubbed *before* the audit middleware so that the middleware wraps the stub,
 * exactly as it wraps the real nunjucks renderer in the running app.
 */
function appWithAuditing({
  username = 'user1',
  renderFails = false,
}: { username?: string | null; renderFails?: boolean } = {}): express.Express {
  const app = express()

  app.use((req, res, next) => {
    req.id = 'request123'
    res.locals.user = username ? { username } : undefined
    res.render = ((_view: string, _options?: object, callback?: (err: Error, html: string) => void) => {
      const error = renderFails ? new Error('render failed') : null
      if (callback) {
        callback(error, renderedHtml)
      } else if (error) {
        next(error)
      } else {
        res.send(renderedHtml)
      }
    }) as typeof res.render
    next()
  })

  app.get('*', auditPageView(auditService))

  app.get('/', (_req, res) => res.render('pages/index'))
  app.get('/:prisonId/view-and-update-locations/:locationId', (_req, res) => res.render('pages/viewLocations/show'))
  app.get('/forbidden', (_req, res) => res.status(403).render('pages/errors/403'))
  app.get('/redirects', (_req, res) => res.redirect('/'))
  app.get('/rendered-for-someone-else', (_req, res) => {
    res.render('pages/fragment', {}, (_err: Error, html: string) => res.send(`wrapped ${html}`))
  })
  app.post('/', (_req, res) => res.render('pages/index'))

  app.use((_error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).render('pages/errors/generic')
  })

  return app
}

const locationPage = '/MDI/view-and-update-locations/7e570000-0000-1000-8000-000000000001'

/** audit events logged, in the order the audit service saw them */
function loggedEvents() {
  return auditService.logAuditEvent.mock.calls.map(([event]) => event.what)
}

beforeEach(() => {
  auditService = new AuditService(null) as jest.Mocked<AuditService>
  auditService.logAuditEvent.mockResolvedValue(undefined)
})

describe('auditPageView', () => {
  it('logs a page view and an access attempt when a page renders', async () => {
    await request(appWithAuditing()).get(locationPage).expect(200).expect(renderedHtml)

    expect(loggedEvents()).toEqual(['PAGE_VIEW', 'PAGE_VIEW_ACCESS_ATTEMPT'])
  })

  it('passes the username, correlation id and page url, and nothing else, to the audit service', async () => {
    await request(appWithAuditing()).get(`${locationPage}?page=2`).expect(200)

    expect(auditService.logAuditEvent).toHaveBeenCalledWith(
      {
        what: 'PAGE_VIEW',
        who: 'user1',
        correlationId: 'request123',
        subjectType: 'NOT_APPLICABLE',
        details: { pageUrl: `${locationPage}?page=2` },
      },
      { throwOnError: false, logOnError: true },
    )
  })

  it('logs only an attempt when a request does not render a page', async () => {
    await request(appWithAuditing()).get('/MDI/no-such-page').expect(404)

    expect(loggedEvents()).toEqual(['PAGE_VIEW_ACCESS_ATTEMPT'])
  })

  it('logs only an attempt when a request is redirected', async () => {
    await request(appWithAuditing()).get('/redirects').expect(302)

    expect(loggedEvents()).toEqual(['PAGE_VIEW_ACCESS_ATTEMPT'])
  })

  it('logs only an attempt when a forbidden page is rendered', async () => {
    await request(appWithAuditing()).get('/forbidden').expect(403)

    expect(loggedEvents()).toEqual(['PAGE_VIEW_ACCESS_ATTEMPT'])
  })

  it('does not audit when there is no signed-in user', async () => {
    await request(appWithAuditing({ username: null }))
      .get(locationPage)
      .expect(200)

    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit form submissions', async () => {
    await request(appWithAuditing()).post('/').expect(200)

    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('leaves renders with their own callback alone, auditing only the attempt', async () => {
    await request(appWithAuditing()).get('/rendered-for-someone-else').expect(200).expect(`wrapped ${renderedHtml}`)

    expect(loggedEvents()).toEqual(['PAGE_VIEW_ACCESS_ATTEMPT'])
  })

  it('still serves the page when auditing fails', async () => {
    auditService.logAuditEvent.mockRejectedValue(new Error('SQS is down'))

    await request(appWithAuditing()).get(locationPage).expect(200).expect(renderedHtml)
  })

  it('passes render errors to the error handler and does not log a page view', async () => {
    await request(appWithAuditing({ renderFails: true }))
      .get(locationPage)
      .expect(500)

    expect(loggedEvents()).toEqual(['PAGE_VIEW_ACCESS_ATTEMPT'])
  })
})
