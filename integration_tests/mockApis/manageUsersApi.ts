import { stubFor } from './wiremock'
import TypedStubber from './typedStubber'

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

const stubManageUsersByCaseload = (page: string = '0') =>
  stubFor({
    request: {
      method: 'GET',
      url: `/manage-users-api/prisonusers/search?inclusiveRoles=true&status=ACTIVE&caseload=TST&accessRoles=MANAGE_RES_LOCATIONS_OP_CAP&page=${page}&size=50`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        content: [{ username: 'joe1', email: 'joe1@test.com' }],
        totalPages: 1,
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

const allStubs = {
  stubManageHealthPing,
  stubManageUsers,
  stubManageUsersMe,
  stubManageUsersMeCaseloads,
  stubManageUsersByCaseload,
  stubManageUsersMeRoles,
}

const ManageUsersApiStubber = new TypedStubber<typeof allStubs>(allStubs)
export default ManageUsersApiStubber
