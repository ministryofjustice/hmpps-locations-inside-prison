import { stubFor } from './wiremock'

const stubComponentsHealthPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/components-api/health',
    },
    response: {
      status: 200,
    },
  })

export default {
  stubComponentsHealthPing,
}
