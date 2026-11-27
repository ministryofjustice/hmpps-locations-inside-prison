import nock from 'nock'

import config from '../config'
import FeComponentsClient, { Component } from './feComponentsClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('feComponentsClient', () => {
  let fakeComponentsApi: nock.Scope
  let componentsClient: FeComponentsClient

  beforeEach(() => {
    fakeComponentsApi = nock(config.apis.frontendComponents.url)
    componentsClient = new FeComponentsClient(null)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getComponents', () => {
    it('should return data from api', async () => {
      const response: { data: { header: Component } } = {
        data: {
          header: {
            html: '<header></header>',
            css: [],
            javascript: [],
          },
        },
      }

      fakeComponentsApi
        .get('/components?component=header&caseloadChangeNotification=true')
        .matchHeader('x-user-token', token.access_token)
        .reply(200, response)

      const output = await componentsClient.getComponents(['header'], token.access_token)
      expect(output).toEqual(response)
    })

    it('should ask for the caseload change notice alongside several components', async () => {
      fakeComponentsApi
        .get('/components?component=header&component=footer&caseloadChangeNotification=true')
        .matchHeader('x-user-token', token.access_token)
        .reply(200, {})

      await componentsClient.getComponents(['header', 'footer'], token.access_token)
      expect(fakeComponentsApi.isDone()).toBe(true)
    })
  })
})
