import { defineConfig } from 'cypress'
import cypressSplit from 'cypress-split'
import superagent from 'superagent'
import { mapValues } from 'lodash'
import { resetStubs, stubFor } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import components from './integration_tests/mockApis/components'
import locationsApi from './integration_tests/mockApis/locationsApi'
import manageUsersApi from './integration_tests/mockApis/manageUsersApi'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import logAccessibilityViolations from './integration_tests/support/accessibilityViolations'
import prisonApi from './integration_tests/mockApis/prisonApi'

async function setFeatureFlag(flags: Record<string, boolean>): Promise<null> {
  const query = mapValues(flags, val => (val ? 'enabled' : 'disabled'))
  await superagent.get(`http://localhost:3007/set-feature-flag`).query(query)

  return null
}

async function resetFeatureFlags(): Promise<null> {
  await superagent.get(`http://localhost:3007/reset-feature-flags`)

  return null
}

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        reset: async () => {
          await resetStubs()
          await stubFor({
            request: {
              method: 'GET',
              urlPattern: '/components-api/components.*',
            },
            response: {
              status: 404,
              headers: {
                'Content-Type': 'application/json;charset=UTF-8',
              },
            },
          })
          await resetFeatureFlags()

          return null
        },
        log: message => {
          // eslint-disable-next-line no-console
          console.log(message)

          return null
        },
        ...auth.allStubs,
        ...components,
        ...locationsApi.allStubs,
        ...manageUsersApi.allStubs,
        ...tokenVerification,
        ...logAccessibilityViolations,
        ...prisonApi,
        setFeatureFlag,
      })
      cypressSplit(on, config)
      return config
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
