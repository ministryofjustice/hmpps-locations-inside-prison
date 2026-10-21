import { stubFor } from './wiremock'
import { SplashCondition, SplashScreen } from '../../server/data/prisonApiClient'
import TypedStubber from './typedStubber'

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

const stubGetSplashScreenCondition = ({
  prisonId = 'TST',
  moduleName = 'OIMMHOLO',
  returnData = { conditionType: 'CASELOAD', conditionValue: 'TST', blockAccess: false },
}: { prisonId?: string; moduleName?: string; returnData?: SplashCondition } = {}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/prison-api/api/splash-screen/${moduleName}/condition/CASELOAD/${prisonId}`,
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
  moduleName: 'OIMMHOLO',
  conditions: [{ conditionType: 'CASELOAD', conditionValue: 'TST', blockAccess: false }],
  warningText: 'WARN',
  blockedText: 'BLOCKED',
  blockAccessType: 'COND',
}
const stubCreateSplashScreenCondition = ({
  moduleName = 'OIMMHOLO',
  returnData = sampleSplashResult,
}: { moduleName?: string; returnData?: SplashScreen } = {}) =>
  stubFor({
    request: {
      method: 'POST',
      urlPath: `/prison-api/api/splash-screen/${moduleName}/condition`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: returnData,
    },
  })

const stubUpdateSplashScreenCondition = ({
  prisonId = 'TST',
  moduleName = 'OIMMHOLO',
  blockScreen = false,
  returnData = sampleSplashResult,
}: { prisonId?: string; moduleName?: string; blockScreen?: boolean; returnData?: SplashScreen } = {}) =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-api/api/splash-screen/${moduleName}/condition/CASELOAD/${prisonId}/${blockScreen}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: returnData,
    },
  })

const allStubs = {
  stubPrisonHealthPing,
  stubGetSplashScreenCondition,
  stubCreateSplashScreenCondition,
  stubUpdateSplashScreenCondition,
}

const PrisonApiStubber = new TypedStubber<typeof allStubs>(allStubs)
export default PrisonApiStubber
