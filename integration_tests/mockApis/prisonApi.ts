import { stubFor } from './wiremock'

const stubPrisonHealthPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/health/ping',
    },
    response: {
      status: 200,
    },
  })

export default {
  stubPrisonHealthPing,
}
