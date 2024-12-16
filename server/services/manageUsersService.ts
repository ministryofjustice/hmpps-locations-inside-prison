import ManageUsersApiClient from '../data/manageUsersApiClient'

export default class ManageUsersService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  async getUser(token: string, username?: string) {
    if (username) {
      try {
        return await this.manageUsersApiClient.users.get(token, { username })
      } catch (e) {
        console.log(e)
        return null
      }
    }

    return this.manageUsersApiClient.users.me.get(token)
  }

  async getUserCaseloads(token: string) {
    return this.manageUsersApiClient.users.me.getCaseloads(token)
  }
}
