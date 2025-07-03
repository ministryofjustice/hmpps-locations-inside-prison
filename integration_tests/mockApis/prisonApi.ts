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

const stubDisplayHousingCheckboxesDisabled = (returnData: {
  status: 404
  userMessage: 'Service DISPLAY_HOUSING_CHECKBOX not turned on for prison TST'
  developerMessage: 'Service DISPLAY_HOUSING_CHECKBOX not turned on for prison TST'
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/service-prisons/DISPLAY_HOUSING_CHECKBOX/prison/[\\w-]+',
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: returnData,
    },
  })

const stubDisplayHousingCheckboxesEnabled = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/service-prisons/DISPLAY_HOUSING_CHECKBOX/prison/[\\w-]+',
    },
    response: {
      status: 204,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubDisplayHousingCheckboxesUpdate = (returnData: { prisonid: 'TST'; prison: 'Test prison' }) =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: '/prison-api/api/service-prisons/DISPLAY_HOUSING_CHECKBOX/prison/[\\w-]+',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
    jsonBody: returnData,
  })

export default {
  stubPrisonHealthPing,
  stubDisplayHousingCheckboxesDisabled,
  stubDisplayHousingCheckboxesEnabled,
  stubDisplayHousingCheckboxesUpdate,
}
