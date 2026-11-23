import type { Request, RequestHandler } from 'express'
import { BadRequest } from 'http-errors'
import config from '../config'

const sanitizeUrl = (url: string) => url.replace(/\/+$/, '')
const isLocalPath = (path: string) =>
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('\\') &&
  !Array.from(path).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)

export interface RegisteredService {
  name: string
  hostname: string
  defaultBackLinkText: string
}

export const registeredBackLinkServices: RegisteredService[] = [
  {
    name: 'digital-prison-services',
    hostname: config.services.dps,
    defaultBackLinkText: 'View most recent search',
  },
  {
    name: 'non-residential-locations',
    hostname: config.services.nonResidentialLocations,
    defaultBackLinkText: 'Back to Non-residential locations',
  },
  {
    name: 'prison-roll-count',
    hostname: config.services.establishmentRoll,
    defaultBackLinkText: 'Back to Establishment roll',
  },
]

const getQueryString = (req: Request, key: 'service' | 'returnPath' | 'redirectPath' | 'backLinkText') => {
  const value = req.query[key]
  return typeof value === 'string' ? value : undefined
}

export const saveBackLink =
  (registeredServices: RegisteredService[] = registeredBackLinkServices): RequestHandler =>
  (req, res) => {
    const service = getQueryString(req, 'service')
    const returnPath = getQueryString(req, 'returnPath')
    const redirectPath = getQueryString(req, 'redirectPath')
    const backLinkText = getQueryString(req, 'backLinkText')

    if (!service || !returnPath || !redirectPath) throw new BadRequest('Required query parameters missing')
    if (req.query.backLinkText !== undefined && backLinkText === undefined) {
      throw new BadRequest('Invalid back link text')
    }

    const registeredService = registeredServices.find(item => item.name === service)
    if (!registeredService) throw new BadRequest(`Could not find service: [${service}]`)
    if (!isLocalPath(returnPath) || !isLocalPath(redirectPath)) {
      throw new BadRequest('Return and redirect paths must be local paths')
    }

    req.session.userBackLink = {
      url: sanitizeUrl(registeredService.hostname) + returnPath,
      text: backLinkText || registeredService.defaultBackLinkText,
    }

    res.redirect(sanitizeUrl(config.ingressUrl) + redirectPath)
  }
