import { Request } from 'express'
import FormWizard from 'hmpo-form-wizard'
import GoogleAnalyticsClient, { GoogleAnalyticsEvent } from '../data/googleAnalyticsClient'
import logger from '../../logger'

export default class AnalyticsService {
  constructor(private readonly googleAnalyticsClient: GoogleAnalyticsClient) {}

  async sendEvent(req: Request | FormWizard.Request, name: string, params: Record<string, unknown>) {
    const event: GoogleAnalyticsEvent = { name: `res_locations_${name}`, params }

    try {
      // eslint-disable-next-line no-underscore-dangle
      const gaClientId = req.cookies?._ga?.match(/.*\.(\d+\.\d+)$/)[1]
      return await this.googleAnalyticsClient.sendEvents(gaClientId, [event])
    } catch (error) {
      return logger.warn(error, 'Failed to send Google Analytics event')
    }
  }
}
