import { type NextFunction, Request, type Response } from 'express'
import logger from '../../logger'

/**
 * Query parameters DPS adds to the return url after a user changes their active caseload via the
 * header switcher (CDPS-2054). DPS only adds them for services that ask for them, which we do in
 * `FeComponentsClient`. They are a hint that the url may describe the prison the user has just left,
 * nothing more. Anyone can put them in a url, so the prison we act on comes from the user's active
 * caseload, never from their values.
 */
export const CASELOAD_SWITCH_PARAMS = ['caseload-switched-from', 'caseload-switched-to'] as const

/**
 * Sends the user to the home page of the prison they have just switched to, and takes the parameters
 * back out of the address bar.
 *
 * We cannot work this out for ourselves: a request for /BFI/... looks identical whether the user has
 * just switched to Cardiff or deliberately opened a Bristol page, which central users with
 * certificate_view_management do routinely. Without the parameters we would show Bristol under a
 * header showing Cardiff.
 *
 * Mount after `res.locals.prisonId` is set and before `validateCaseload`. Redirecting someone to their
 * own active caseload is always safe, and the redirected request runs the full chain anyway.
 */
export default function handleCaseloadChange(req: Request, res: Response, next: NextFunction) {
  if (!CASELOAD_SWITCH_PARAMS.some(param => param in req.query)) {
    next()
    return
  }

  const activeCaseloadId = res.locals.user?.activeCaseload?.id
  const { prisonId } = res.locals

  if (activeCaseloadId && activeCaseloadId !== prisonId) {
    logger.info(`Caseload changed to ${activeCaseloadId}, redirecting from ${prisonId}`)
    // Go to the new prison's home page. Any location id and query string in the url belong to the
    // prison being left, so neither is carried over.
    res.redirect(`/${activeCaseloadId}`)
    return
  }

  res.redirect(urlWithoutSwitchParams(req))
}

/** The requested url with the switch parameters removed, so the redirect cannot carry them onwards */
function urlWithoutSwitchParams(req: Request): string {
  const url = new URL(req.originalUrl, 'http://relative.invalid')
  CASELOAD_SWITCH_PARAMS.forEach(param => url.searchParams.delete(param))
  return `${url.pathname}${url.search}`
}
