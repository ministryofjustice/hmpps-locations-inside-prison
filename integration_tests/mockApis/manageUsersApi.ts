import { stubFor } from './wiremock'

const stubManageUsers = (name: string = 'john smith') =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/users/\\w+',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username: 'USER1',
        active: true,
        name,
      },
    },
  })

const stubManageUsersMe = (name: string = 'john smith') =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username: 'USER1',
        active: true,
        name,
      },
    },
  })

const stubManageUsersMeRoles = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/users/me/roles',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [{ roleCode: 'SOME_USER_ROLE' }],
    },
  })

const stubManageUsersMeCaseloads = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/users/me/caseloads',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username: 'USER1',
        active: true,
        accountType: 'GENERAL',
        activeCaseload: {
          id: 'TST',
          name: 'TEST (HMP)',
        },
        caseloads: [
          {
            id: 'TST',
            name: 'TEST (HMP)',
          },
        ],
      },
    },
  })

const stubManageHealthPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/health/ping',
    },
    response: {
      status: 200,
    },
  })

export default {
  stubManageHealthPing,
  stubManageUsers,
  stubManageUsersMe,
  stubManageUsersMeCaseloads,
  stubManageUsersMeRoles,
}
