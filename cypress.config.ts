import { defineConfig } from 'cypress'
import superagent from 'superagent'
import { mapValues } from 'lodash'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import components from './integration_tests/mockApis/components'
import locationsApi from './integration_tests/mockApis/locationsApi'
import manageUsersApi from './integration_tests/mockApis/manageUsersApi'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import logAccessibilityViolations from './integration_tests/support/accessibilityViolations'

async function setFeatureFlag(flags: Record<string, boolean>): Promise<null> {
  const query = mapValues(flags, val => (val ? 'enabled' : 'disabled'))
  await superagent.get(`http://localhost:3007/set-feature-flag`).query(query)

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
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...components,
        ...locationsApi,
        ...manageUsersApi,
        ...tokenVerification,
        ...logAccessibilityViolations,
        setFeatureFlag,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
