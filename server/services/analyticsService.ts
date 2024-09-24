import GoogleAnalyticsClient, { GoogleAnalyticsEvent } from '../data/googleAnalyticsClient'

export default class AnalyticsService {
  constructor(private readonly googleAnalyticsClient: GoogleAnalyticsClient) {}

  async sendEvents(clientId: string, events: GoogleAnalyticsEvent[]) {
    return this.googleAnalyticsClient.sendEvents(clientId, events)
  }
}
