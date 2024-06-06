import config from '../config'
import BaseApiClient from './baseApiClient'

export interface User {
  username: string
  name?: string
  active?: boolean
  authSource?: string
  uuid?: string
  userId?: string
  activeCaseLoadId?: string // Will be removed from User. For now, use 'me/caseloads' endpoint in 'nomis-user-roles-api'
}

export interface Caseload {
  id: string
  name: string
}

interface UserCaseloads {
  username: string
  active: boolean
  accountType: string
  activeCaseload: Caseload
  caseloads: Caseload[]
}

export interface UserRole {
  roleCode: string
}

export default class ManageUsersApiClient extends BaseApiClient {
  protected static config() {
    return config.apis.manageUsersApi
  }

  users = {
    me: {
      get: this.apiCall<User, null>({
        path: '/users/me',
        requestType: 'get',
      }),
      getCaseloads: this.apiCall<UserCaseloads, null>({
        path: '/users/me/caseloads',
        requestType: 'get',
      }),
    },
    get: this.apiCall<User, { username: string }>({
      path: '/users/:username',
      requestType: 'get',
      options: { cacheDuration: 86_400 },
    }),
  }
}
