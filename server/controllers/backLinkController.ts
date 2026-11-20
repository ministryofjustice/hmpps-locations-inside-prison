import type { Request, RequestHandler } from 'express'
import config from '../config'

const sanitizeUrl = (url: string) => (url.endsWith('/') ? url.substring(0, url.length - 1) : url)

export interface RegisteredService {
  name: string
  hostname: string
  defaultBackLinkText: string
}

export const registeredBackLinkServices: RegisteredService[] = [
  {
    name: 'digital-prison-services',
    hostname: sanitizeUrl(config.services.dps),
    defaultBackLinkText: 'View most recent search',
  },
  {
    name: 'non-residential-locations',
    hostname: sanitizeUrl(config.services.nonResidentialLocations),
    defaultBackLinkText: 'Back to Non-residential locations',
  },
  {
    name: 'prison-roll-count',
    hostname: sanitizeUrl(config.services.establishmentRoll),
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

    if (!service || !returnPath || !redirectPath) throw new Error('Required query parameters missing')

    const registeredService = registeredServices.find(item => item.name === service)
    if (!registeredService) throw new Error(`Could not find service: [${service}]`)

    req.session.userBackLink = {
      url: registeredService.hostname + returnPath,
      text: backLinkText || registeredService.defaultBackLinkText,
    }

    res.redirect(sanitizeUrl(config.ingressUrl) + redirectPath)
  }
