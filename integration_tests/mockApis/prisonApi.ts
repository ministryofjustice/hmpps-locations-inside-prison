import { stubFor } from './wiremock'
import { SplashCondition, SplashScreen } from '../../server/data/prisonApiClient'

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

const stubDisplayHousingCheckboxesEnabled = (returnData: {
  status: 404
  userMessage: 'Service DISPLAY_HOUSING_CHECKBOX not turned on for prison TST'
  developerMessage: 'Service DISPLAY_HOUSING_CHECKBOX not turned on for prison TST'
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/agency-switches/DISPLAY_HOUSING_CHECKBOX/agency/[\\w-]+',
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubDisplayHousingCheckboxesDisabled = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/agency-switches/DISPLAY_HOUSING_CHECKBOX/agency/[\\w-]+',
    },
    response: {
      status: 204,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubDisplayHousingCheckboxesDelete = () =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: '/prison-api/api/agency-switches/DISPLAY_HOUSING_CHECKBOX/agency/[\\w-]+',
    },
    response: {
      status: 204,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubDisplayHousingCheckboxesPost = (returnData: { prisonid: 'TST'; prison: 'Test prison' }) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/prison-api/api/agency-switches/DISPLAY_HOUSING_CHECKBOX/agency/[\\w-]+',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
    jsonBody: returnData,
  })

const stubGetSplashScreenCondition = (
  prisonId: string = 'TST',
  returnData: SplashCondition = { conditionType: 'CASELOAD', conditionValue: 'TST', blockAccess: false },
) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/prison-api/api/splash-screen/OIDCHOLO/condition/CASELOAD/${prisonId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: returnData,
    },
  })

const sampleSplashResult = {
  moduleName: 'OIDCHOLO',
  conditions: [{ conditionType: 'CASELOAD', conditionValue: 'TST', blockAccess: false }],
  warningText: 'WARN',
  blockedText: 'BLOCKED',
  blockAccessType: 'COND',
}
const stubCreateSplashScreenCondition = (returnData: SplashScreen = sampleSplashResult) =>
  stubFor({
    request: {
      method: 'POST',
      urlPath: '/prison-api/api/splash-screen/OIDCHOLO/condition',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: returnData,
    },
  })

const stubUpdateSplashScreenCondition = (
  prisonId: string = 'TST',
  blockScreen: boolean = false,
  returnData: SplashScreen = sampleSplashResult,
) =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-api/api/splash-screen/OIDCHOLO/condition/CASELOAD/${prisonId}/${blockScreen}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: returnData,
    },
  })

export default {
  stubPrisonHealthPing,
  stubDisplayHousingCheckboxesDisabled,
  stubDisplayHousingCheckboxesEnabled,
  stubDisplayHousingCheckboxesDelete,
  stubDisplayHousingCheckboxesPost,
  stubGetSplashScreenCondition,
  stubCreateSplashScreenCondition,
  stubUpdateSplashScreenCondition,
}
