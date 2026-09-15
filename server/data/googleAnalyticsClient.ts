import superagent from 'superagent'
import config from '../config'
import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { restClientMetricsMiddleware } from './restClientMetricsMiddleware'

export type GoogleAnalyticsEvent = {
  name: string
  params: object
}

type GoogleAnalyticsPayload = {
  client_id: string
  non_personalized_ads: boolean
  events: GoogleAnalyticsEvent[]
}

export default class GoogleAnalyticsClient {
  constructor() {}

  async post(data: GoogleAnalyticsPayload): Promise<unknown> {
    const { measurementId, measurementApi } = config.googleAnalytics
    if (!measurementId || !measurementApi.secret) {
      return undefined
    }

    logger.info(`Google Analytics API POST: /mp/collect`)

    try {
      const result = await superagent
        .post(`${measurementApi.url}/mp/collect`)
        .query({ measurement_id: measurementId, api_secret: measurementApi.secret })
        .send(data)
        .use(restClientMetricsMiddleware)
        .timeout({ deadline: 10000, response: 10000 })

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn(`Error calling Google Analytics API, path: '/mp/collect', verb: 'POST'`, { ...sanitisedError })
      throw sanitisedError
    }
  }

  async sendEvents(clientId: string, events: GoogleAnalyticsEvent[]) {
    return this.post({ client_id: clientId, non_personalized_ads: true, events })
  }
}
