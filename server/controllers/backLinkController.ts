import { RequestHandler } from 'express'
import config from '../config'

const sanitizeUrl = (url: string) => (url?.endsWith('/') ? url.substring(0, url.length - 1) : url)

export interface RegisteredService {
  name: string
  hostname: string
  defaultBackLinkText: string
}

export const registeredBackLinkServices: RegisteredService[] = [
  {
    name: 'establishment-roll',
    hostname: sanitizeUrl(config.services.establishmentRoll),
    defaultBackLinkText: 'Back to Establishment roll',
  },
]

export const saveBackLink =
  (registeredServices: Array<RegisteredService> = registeredBackLinkServices): RequestHandler =>
  async (req, res) => {
    const { service, returnPath, redirectPath, backLinkText } = req.query as Partial<{
      service: string
      returnPath: string
      redirectPath: string
      backLinkText: string
    }>

    if (!service || !returnPath || !redirectPath) throw new Error('Required query parameters missing')

    const registeredService = registeredServices.find(e => e.name === service)
    if (!registeredService) throw new Error(`Could not find service: [${service}]`)

    res.redirect(sanitizeUrl(config.ingressUrl) + redirectPath)
  }
