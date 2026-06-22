import path from 'node:path'
import { defineConfig } from 'cypress'
import webpackPreprocessor from '@cypress/webpack-batteries-included-preprocessor'
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

function preprocessorOptions() {
  const replacementModulesPath = path.resolve(__dirname, './integration_tests/support/replacementModules')
  const options = webpackPreprocessor.defaultOptions
  options.typescript = require.resolve('typescript')
  options.webpackOptions.resolve.alias = {
    bunyan: path.join(replacementModulesPath, 'bunyan.ts'),
    'bunyan-format': path.join(replacementModulesPath, 'bunyan-format.ts'),
  }
  return options
}

export default defineConfig({
  chromeWebSecurity: false,
  // Prevent headless Chrome from accumulating memory and hanging the runner in CI,
  // which intermittently stalls a single Cypress split container until the job timeout.
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 0,
  // Re-run flaky specs in CI (e.g. WireMock sign-in races) instead of failing the build.
  retries: { runMode: 2, openMode: 0 },
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
      on('file:preprocessor', webpackPreprocessor(preprocessorOptions()))
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
