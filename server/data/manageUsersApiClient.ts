import config from '../config'
import RestClient from './restClient'

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

export default class ManageUsersApiClient {
  constructor() {}

  private static restClient(token: string): RestClient {
    return new RestClient('Manage Users Api Client', config.apis.manageUsersApi, token)
  }

  users = {
    me: {
      get(token: string) {
        return ManageUsersApiClient.restClient(token).get<User>({ path: '/users/me' })
      },
      getCaseloads(token: string) {
        return ManageUsersApiClient.restClient(token).get<UserCaseloads>({ path: '/users/me/caseloads' })
      },
    },
  }
}
