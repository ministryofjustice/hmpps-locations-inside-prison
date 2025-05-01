import { stubFor } from './wiremock'

const stubComponentsHealthPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/components-api/health/ping',
    },
    response: {
      status: 200,
    },
  })

export default {
  stubComponentsHealthPing,
}
