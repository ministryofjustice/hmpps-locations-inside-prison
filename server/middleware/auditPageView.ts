import type { AuditService, PageViewEventDetails } from '@ministryofjustice/hmpps-audit-client'
import type { RequestHandler } from 'express'

import logger from '../../logger'

type RenderCallback = (err: Error, html: string) => void
type ResRender = (view: string, options?: object, callback?: RenderCallback) => void

/**
 * Audits page views to HMPPS Audit.
 *
 * Emits PAGE_VIEW_ACCESS_ATTEMPT once the response closes – covering redirects, errors and
 * requests refused downstream by a route's permission or caseload checks – and PAGE_VIEW when a
 * page renders successfully.
 *
 * Mount after authentication but before the routes, so that refused requests are still recorded
 * as attempts. Health checks, static resources and the sign-in routes are mounted earlier in
 * app.ts so never reach here.
 *
 * Pages in this service are about prisons and locations, never a person, so the subject is always
 * NOT_APPLICABLE. The prison and location are in the page url.
 */
export default function auditPageView(auditService: Pick<AuditService, 'logAuditEvent'>): RequestHandler {
  return (req, res, next) => {
    const who = res.locals.user?.username
    if (!who) {
      next()
      return
    }

    const auditEvent: PageViewEventDetails = {
      who,
      correlationId: req.id,
      details: { pageUrl: req.originalUrl },
      subjectType: 'NOT_APPLICABLE',
    }

    res.prependOnceListener('close', () => {
      logPageView(auditService, auditEvent, 'PAGE_VIEW_ACCESS_ATTEMPT')
    })

    const resRender = res.render as ResRender
    res.render = ((view: string, options?: object | RenderCallback, callback?: RenderCallback) => {
      // callers that handle the rendered html themselves are not sending a page, so are not audited
      if (typeof options === 'function' || callback) {
        resRender.call(res, view, options as object, callback)
        return
      }
      resRender.call(res, view, options, (err: Error, html: string) => {
        if (err) {
          next(err)
          return
        }
        // send the page first: auditing must never delay or break rendering
        res.send(html)
        // error and forbidden pages are rendered too, but are not successful page views
        if (res.statusCode < 400) {
          logPageView(auditService, auditEvent, 'PAGE_VIEW')
        }
      })
    }) as typeof res.render

    next()
  }
}

function logPageView(
  auditService: Pick<AuditService, 'logAuditEvent'>,
  auditEvent: PageViewEventDetails,
  what: 'PAGE_VIEW' | 'PAGE_VIEW_ACCESS_ATTEMPT',
): void {
  // auditing must not be able to break page rendering, so never throw
  auditService.logAuditEvent({ ...auditEvent, what }, { throwOnError: false, logOnError: true }).catch(error => {
    logger.error(error, 'Failed to audit page view')
  })
}
