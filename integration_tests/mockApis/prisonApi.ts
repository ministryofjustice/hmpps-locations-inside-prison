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

const stubDisplayHousingCheckboxesDelete = (returnData: { prisonid: 'TST'; prison: 'Test prison' }) =>
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
    jsonBody: returnData,
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

export default {
  stubPrisonHealthPing,
  stubDisplayHousingCheckboxesDisabled,
  stubDisplayHousingCheckboxesEnabled,
  stubDisplayHousingCheckboxesDelete,
  stubDisplayHousingCheckboxesPost,
}
